import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, IsNull } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Product, ValuationMethod } from './entities/product.entity';
import { Warehouse } from './entities/warehouse.entity';
import { ProductVariant } from './entities/product-variant.entity';
import {
  StockMovement,
  StockMovementType,
} from './entities/stock-movement.entity';
import { Batch } from './entities/batch.entity';
import { Bin } from './entities/bin.entity';
import { Zone } from './entities/zone.entity';
import { Rack } from './entities/rack.entity';

import { StockCount } from './entities/stock-count.entity';
import { StockCountItem } from './entities/stock-count-item.entity';

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Zone)
    private readonly zoneRepo: Repository<Zone>,
    @InjectRepository(Rack)
    private readonly rackRepo: Repository<Rack>,
    @InjectRepository(Bin)
    private readonly binRepo: Repository<Bin>,
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(StockMovement)
    private readonly movementRepo: Repository<StockMovement>,
    @InjectQueue('inventory_alerts')
    private readonly alertQueue: Queue,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    // Schedule reorder point check daily at midnight
    await this.alertQueue.add(
      'check_reorder_points',
      {},
      {
        repeat: {
          pattern: '0 0 * * *',
        },
        jobId: 'daily_reorder_check',
      },
    );
    this.logger.log('Scheduled daily reorder point checks');
  }

  async createProduct(dto: Partial<Product>): Promise<Product> {
    const exists = await this.productRepo.findOne({ where: { sku: dto.sku } });
    if (exists) throw new ConflictException(`SKU "${dto.sku}" already exists`);
    const product = this.productRepo.create(dto);
    return this.productRepo.save(product);
  }

  async createVariant(dto: Partial<ProductVariant>): Promise<ProductVariant> {
    const exists = await this.variantRepo.findOne({ where: { sku: dto.sku } });
    if (exists)
      throw new ConflictException(`Variant SKU "${dto.sku}" already exists`);
    const variant = this.variantRepo.create(dto);
    return this.variantRepo.save(variant);
  }

  async createWarehouse(dto: Partial<Warehouse>): Promise<Warehouse> {
    const wh = this.warehouseRepo.create(dto);
    return this.warehouseRepo.save(wh);
  }

  async createZone(dto: Partial<Zone>): Promise<Zone> {
    const zone = this.zoneRepo.create(dto);
    return this.zoneRepo.save(zone);
  }

  async createRack(dto: Partial<Rack>): Promise<Rack> {
    const rack = this.rackRepo.create(dto);
    return this.rackRepo.save(rack);
  }

  async createBin(dto: Partial<Bin>): Promise<Bin> {
    const bin = this.binRepo.create(dto);
    return this.binRepo.save(bin);
  }

  /**
   * Receive stock into a warehouse/bin. Creates a new batch.
   */
  async receiveStock(dto: {
    productId: string;
    variantId?: string;
    warehouseId: string;
    binId?: string;
    batchNumber: string;
    expiryDate?: Date;
    quantity: number;
    unitCost: number;
    reference?: string;
  }) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Create/Find Batch
      let batch = await manager.findOne(Batch, {
        where: {
          productId: dto.productId,
          variantId: dto.variantId || IsNull(),
          batchNumber: dto.batchNumber,
        },
      });

      if (batch) {
        batch.remainingQuantity =
          Number(batch.remainingQuantity) + dto.quantity;
      } else {
        batch = manager.create(Batch, {
          productId: dto.productId,
          variantId: dto.variantId,
          batchNumber: dto.batchNumber,
          expiryDate: dto.expiryDate,
          initialQuantity: dto.quantity,
          remainingQuantity: dto.quantity,
          unitCost: dto.unitCost,
        });
      }
      await manager.save(batch);

      // 2. Update Moving Average Cost if using Weighted Average
      const product = await manager.findOne(Product, {
        where: { id: dto.productId },
      });
      if (
        product &&
        product.valuationMethod === ValuationMethod.WEIGHTED_AVERAGE
      ) {
        const totalStockResult = await manager
          .createQueryBuilder(Batch, 'b')
          .where('b.productId = :pid', { pid: dto.productId })
          .select('SUM(b.remainingQuantity)', 'total')
          .addSelect('SUM(b.remainingQuantity * b.unitCost)', 'value')
          .getRawOne();

        const currentQty = Number(totalStockResult?.total || 0);
        const currentValue = Number(totalStockResult?.value || 0);

        const newTotalQty = currentQty + dto.quantity;
        const newTotalValue = currentValue + dto.quantity * dto.unitCost;

        if (newTotalQty > 0) {
          product.basePrice = newTotalValue / newTotalQty;
          await manager.save(product);
          this.logger.log(
            `Updated Weighted Average Cost for ${product.sku}: ${product.basePrice}`,
          );
        }
      }

      // 3. Create Stock Movement
      const movement = manager.create(StockMovement, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        binId: dto.binId,
        batchId: batch.id,
        type: StockMovementType.RECEIPT,
        quantity: dto.quantity,
        unitCost: dto.unitCost,
        totalCost: dto.quantity * dto.unitCost,
        reference: dto.reference,
      });
      await manager.save(movement);

      return movement;
    });
  }

  /**
   * Issue stock from a warehouse. Handles FIFO/LIFO valuation.
   */
  async issueStock(dto: {
    productId: string;
    variantId?: string;
    warehouseId: string;
    quantity: number;
    reference?: string;
    reasonCode?: string;
  }) {
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: dto.productId },
      });
      if (!product) throw new NotFoundException('Product not found');

      // 1. Find available batches based on valuation method
      let orderByField = 'receivedDate';
      let orderByDir = 'ASC';

      if (product.valuationMethod === ValuationMethod.FIFO) {
        orderByField = 'receivedDate';
        orderByDir = 'ASC';
      } else if (product.valuationMethod === ValuationMethod.LIFO) {
        orderByField = 'receivedDate';
        orderByDir = 'DESC';
      } else if (product.valuationMethod === ValuationMethod.FEFO) {
        orderByField = 'expiryDate';
        orderByDir = 'ASC';
      }

      const availableBatches = await manager
        .createQueryBuilder(Batch, 'b')
        .where('b.productId = :pid', { pid: dto.productId })
        .andWhere('b.variantId IS NOT DISTINCT FROM :vid', {
          vid: dto.variantId || null,
        })
        .andWhere('b.remainingQuantity > 0')
        .orderBy(`b.${orderByField}`, orderByDir as any)
        .addOrderBy('b.receivedDate', 'ASC') // Tie breaker
        .getMany();

      let remainingToIssue = dto.quantity;
      const movements: StockMovement[] = [];

      for (const batch of availableBatches) {
        if (remainingToIssue <= 0) break;

        const issueFromBatch = Math.min(
          batch.remainingQuantity,
          remainingToIssue,
        );
        batch.remainingQuantity =
          Number(batch.remainingQuantity) - issueFromBatch;
        await manager.save(batch);

        const movement = manager.create(StockMovement, {
          productId: dto.productId,
          variantId: dto.variantId,
          warehouseId: dto.warehouseId,
          batchId: batch.id,
          type: StockMovementType.ISSUE,
          quantity: -issueFromBatch, // Negative for issue
          unitCost: batch.unitCost,
          totalCost: issueFromBatch * batch.unitCost,
          reference: dto.reference,
          reasonCode: dto.reasonCode,
        });
        movements.push(await manager.save(movement));

        remainingToIssue -= issueFromBatch;
      }

      if (remainingToIssue > 0) {
        throw new BadRequestException(
          `Insufficient stock for product ${dto.productId}. Missing ${remainingToIssue} units.`,
        );
      }

      return movements;
    });
  }

  /**
   * Transfer stock between warehouses or bins.
   */
  async transferStock(dto: {
    productId: string;
    variantId?: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    fromBinId?: string;
    toBinId?: string;
    batchId: string;
    quantity: number;
    reference?: string;
  }) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Check stock in source
      // For simplicity, we assume transfer is from a specific batch
      const batch = await manager.findOne(Batch, {
        where: { id: dto.batchId },
      });
      if (!batch || batch.remainingQuantity < dto.quantity) {
        throw new BadRequestException(
          'Insufficient stock in specified batch for transfer',
        );
      }

      // 2. Issue from source
      const issueMove = manager.create(StockMovement, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.fromWarehouseId,
        binId: dto.fromBinId,
        batchId: dto.batchId,
        type: StockMovementType.TRANSFER,
        quantity: -dto.quantity,
        unitCost: batch.unitCost,
        totalCost: dto.quantity * batch.unitCost,
        reference: dto.reference,
      });
      await manager.save(issueMove);

      // 3. Receipt into destination
      const receiptMove = manager.create(StockMovement, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.toWarehouseId,
        binId: dto.toBinId,
        batchId: dto.batchId,
        type: StockMovementType.TRANSFER,
        quantity: dto.quantity,
        unitCost: batch.unitCost,
        totalCost: dto.quantity * batch.unitCost,
        reference: dto.reference,
      });
      await manager.save(receiptMove);

      return { issueMove, receiptMove };
    });
  }

  /**
   * Manual stock adjustment.
   */
  async adjustStock(dto: {
    productId: string;
    variantId?: string;
    warehouseId: string;
    binId?: string;
    batchId: string;
    adjustmentQuantity: number; // Positive for add, negative for remove
    reasonCode: string;
    notes?: string;
  }) {
    return this.dataSource.transaction(async (manager) => {
      const batch = await manager.findOne(Batch, {
        where: { id: dto.batchId },
      });
      if (!batch) throw new NotFoundException('Batch not found');

      if (Number(batch.remainingQuantity) + dto.adjustmentQuantity < 0) {
        throw new BadRequestException(
          'Adjustment would result in negative stock',
        );
      }

      batch.remainingQuantity =
        Number(batch.remainingQuantity) + dto.adjustmentQuantity;
      await manager.save(batch);

      const movement = manager.create(StockMovement, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        binId: dto.binId,
        batchId: batch.id,
        type: StockMovementType.ADJUSTMENT,
        quantity: dto.adjustmentQuantity,
        unitCost: batch.unitCost,
        totalCost: Math.abs(dto.adjustmentQuantity) * batch.unitCost,
        reasonCode: dto.reasonCode,
        reference: dto.notes,
      });
      return manager.save(movement);
    });
  }

  async getStockLevels(_productId?: string, _warehouseId?: string) {
    // ... (existing code)
  }

  async startStockCount(warehouseId: string, notes?: string) {
    return this.dataSource.transaction(async (manager) => {
      const stockCount = manager.create(StockCount, {
        warehouseId,
        notes,
        status: 'IN_PROGRESS' as any,
        startedAt: new Date(),
      });
      const savedCount = await manager.save(stockCount);

      // Populate items with expected quantities
      const batches = await manager
        .createQueryBuilder(Batch, 'b')
        .where('b.remainingQuantity > 0')
        .getMany();

      for (const batch of batches) {
        const item = manager.create(StockCountItem, {
          stockCountId: savedCount.id,
          productId: batch.productId,
          variantId: batch.variantId,
          batchId: batch.id,
          expectedQuantity: batch.remainingQuantity,
          actualQuantity: batch.remainingQuantity, // Default to expected
        });
        await manager.save(item);
      }

      return savedCount;
    });
  }

  async completeStockCount(countId: string) {
    return this.dataSource.transaction(async (manager) => {
      const count = await manager.findOne(StockCount, {
        where: { id: countId },
        relations: ['items'],
      });
      if (!count) throw new NotFoundException('Stock count not found');
      if (count.status === ('COMPLETED' as any))
        throw new BadRequestException('Already completed');

      for (const item of count.items) {
        const diff =
          Number(item.actualQuantity) - Number(item.expectedQuantity);
        if (diff !== 0) {
          // Create adjustment
          await this.adjustStock({
            productId: item.productId,
            variantId: item.variantId || undefined,
            warehouseId: count.warehouseId,
            batchId: item.batchId || '',
            adjustmentQuantity: diff,
            reasonCode: 'STOCK_COUNT_ADJUSTMENT',
            notes: `Auto-adjustment from stock count ${countId}`,
          });
        }
        item.difference = diff;
        await manager.save(item);
      }

      count.status = 'COMPLETED' as any;
      count.completedAt = new Date();
      return manager.save(count);
    });
  }

  async getInventoryAging() {
    // We'll use QueryBuilder for a more efficient aging bucket report
    const now = new Date();
    const result = await this.batchRepo
      .createQueryBuilder('b')
      .select('b.productId', 'productId')
      .addSelect(
        'SUM(CASE WHEN b.receivedDate > :thirtyDays THEN b.remainingQuantity ELSE 0 END)',
        '0_30_days',
      )
      .addSelect(
        'SUM(CASE WHEN b.receivedDate <= :thirtyDays AND b.receivedDate > :sixtyDays THEN b.remainingQuantity ELSE 0 END)',
        '31_60_days',
      )
      .addSelect(
        'SUM(CASE WHEN b.receivedDate <= :sixtyDays AND b.receivedDate > :ninetyDays THEN b.remainingQuantity ELSE 0 END)',
        '61_90_days',
      )
      .addSelect(
        'SUM(CASE WHEN b.receivedDate <= :ninetyDays THEN b.remainingQuantity ELSE 0 END)',
        'over_90_days',
      )
      .setParameters({
        thirtyDays: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        sixtyDays: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        ninetyDays: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      })
      .groupBy('b.productId')
      .getRawMany();

    return result;
  }

  async checkReorderPoints() {
    const products = await this.productRepo.find();
    const alerts: any[] = [];

    for (const product of products) {
      const stock = await this.batchRepo
        .createQueryBuilder('b')
        .where('b.productId = :pid', { pid: product.id })
        .select('SUM(b.remainingQuantity)', 'total')
        .getRawOne();

      const totalStock = Number(stock?.total || 0);
      if (totalStock <= product.reorderPoint) {
        alerts.push({
          productId: product.id,
          sku: product.sku,
          name: product.name,
          currentStock: totalStock,
          reorderPoint: product.reorderPoint,
        });
        this.logger.warn(
          `Reorder alert for ${product.sku}: Current stock ${totalStock} <= Reorder point ${product.reorderPoint}`,
        );
      }
    }
    return alerts;
  }
}
