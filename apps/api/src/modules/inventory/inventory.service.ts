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
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { GoodsIssue } from './entities/goods-issue.entity';
import { GoodsReturn } from './entities/goods-return.entity';
import {
  StockTransfer,
  StockTransferStatus,
} from './entities/stock-transfer.entity';
import { SerialNumber } from './entities/serial-number.entity';
import { Bom } from './entities/bom.entity';
import { UomGroup } from './entities/uom-group.entity';
import { Inventory } from './entities/inventory.entity';
import { EntityManager } from 'typeorm';
import { ClsService } from 'nestjs-cls';

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
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectQueue('inventory_alerts')
    private readonly alertQueue: Queue,
    private readonly dataSource: DataSource,
    private readonly cls: ClsService,
  ) {}

  private async updateInventoryBalance(
    manager: EntityManager,
    tenantId: string,
    dto: {
      productId: string;
      variantId?: string;
      warehouseId: string;
      binId?: string;
      batchId?: string;
      quantity: number;
    },
  ) {
    let inventory = await manager.findOne(Inventory, {
      where: {
        tenantId,
        productId: dto.productId,
        variantId: dto.variantId || IsNull(),
        warehouseId: dto.warehouseId,
        binId: dto.binId || IsNull(),
        batchId: dto.batchId || IsNull(),
      },
    });

    if (inventory) {
      inventory.quantity = Number(inventory.quantity) + dto.quantity;
      inventory.lastUpdated = new Date();
    } else {
      inventory = manager.create(Inventory, {
        tenantId,
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        binId: dto.binId,
        batchId: dto.batchId,
        quantity: dto.quantity,
      });
    }

    if (Number(inventory.quantity) < 0) {
      // Check if product allows negative stock
      const product = await manager.findOne(Product, {
        where: { id: dto.productId },
      });
      if (!product?.allowNegativeStock) {
        throw new BadRequestException(
          `Insufficient stock for product ${dto.productId} in warehouse ${dto.warehouseId}`,
        );
      }
    }

    await manager.save(inventory);
  }

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
    await this.alertQueue.add(
      'check_expiry_dates',
      {},
      {
        repeat: {
          pattern: '0 0 * * *',
        },
        jobId: 'daily_expiry_check',
      },
    );
    this.logger.log('Scheduled daily reorder point and expiry checks');
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
    const tenantId = this.cls.get('tenantId');
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

      // 2. Update Inventory Balance (Warehouse-aware)
      await this.updateInventoryBalance(manager, tenantId, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        binId: dto.binId,
        batchId: batch.id,
        quantity: dto.quantity,
      });

      // 3. Update Moving Average Cost if using Weighted Average
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

        const newTotalQty = currentQty; // Batch.remainingQuantity is already updated
        const newTotalValue = currentValue; // This sum includes the updated batch

        if (newTotalQty > 0) {
          product.basePrice = newTotalValue / newTotalQty;
          await manager.save(product);
          this.logger.log(
            `Updated Weighted Average Cost for ${product.sku}: ${product.basePrice}`,
          );
        }
      }

      // 4. Create Stock Movement
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
    const tenantId = this.cls.get('tenantId');
    return this.dataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: dto.productId },
      });
      if (!product) throw new NotFoundException('Product not found');

      // 1. Find available batches based on valuation method, filtered by warehouse
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

      const availableInventory = await manager
        .createQueryBuilder(Inventory, 'inv')
        .innerJoinAndSelect('inv.batch', 'batch')
        .where('inv.productId = :pid', { pid: dto.productId })
        .andWhere('inv.warehouseId = :whid', { whid: dto.warehouseId })
        .andWhere('inv.variantId IS NOT DISTINCT FROM :vid', {
          vid: dto.variantId || null,
        })
        .andWhere('inv.quantity > 0')
        .orderBy(`batch.${orderByField}`, orderByDir as any)
        .addOrderBy('batch.receivedDate', 'ASC')
        .getMany();

      let remainingToIssue = dto.quantity;
      const movements: StockMovement[] = [];

      for (const item of availableInventory) {
        if (remainingToIssue <= 0) break;

        const issueFromBatch = Math.min(
          Number(item.quantity),
          remainingToIssue,
        );

        // Update Global Batch Total
        const batch = item.batch;
        batch.remainingQuantity =
          Number(batch.remainingQuantity) - issueFromBatch;
        await manager.save(batch);

        // Update Warehouse Balance
        await this.updateInventoryBalance(manager, tenantId, {
          productId: dto.productId,
          variantId: dto.variantId,
          warehouseId: dto.warehouseId,
          binId: item.binId || undefined,
          batchId: batch.id,
          quantity: -issueFromBatch,
        });

        const movement = manager.create(StockMovement, {
          productId: dto.productId,
          variantId: dto.variantId,
          warehouseId: dto.warehouseId,
          binId: item.binId,
          batchId: batch.id,
          type: StockMovementType.ISSUE,
          quantity: -issueFromBatch,
          unitCost: batch.unitCost,
          totalCost: issueFromBatch * batch.unitCost,
          reference: dto.reference,
          reasonCode: dto.reasonCode,
        });
        movements.push(await manager.save(movement));

        remainingToIssue -= issueFromBatch;
      }

      if (remainingToIssue > 0 && !product.allowNegativeStock) {
        throw new BadRequestException(
          `Insufficient stock for product ${dto.productId} in warehouse ${dto.warehouseId}. Missing ${remainingToIssue} units.`,
        );
      } else if (remainingToIssue > 0 && product.allowNegativeStock) {
        // Handle negative stock if allowed (issue from dummy or default batch if needed, but logic usually requires a batch)
        // For now, we'll just throw unless there's a specific "Default" batch
        this.logger.warn(
          `Negative stock allowed but no batch available for remaining ${remainingToIssue} units.`,
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
    const tenantId = this.cls.get('tenantId');
    return this.dataSource.transaction(async (manager) => {
      // 1. Check stock in source warehouse for this specific batch
      const inventory = await manager.findOne(Inventory, {
        where: {
          tenantId,
          productId: dto.productId,
          warehouseId: dto.fromWarehouseId,
          binId: dto.fromBinId || IsNull(),
          batchId: dto.batchId,
        },
      });

      if (!inventory || Number(inventory.quantity) < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock in batch ${dto.batchId} at warehouse ${dto.fromWarehouseId} for transfer`,
        );
      }

      const batch = await manager.findOne(Batch, {
        where: { id: dto.batchId },
      });
      if (!batch) throw new NotFoundException('Batch not found');

      // 2. Update Source Balance
      await this.updateInventoryBalance(manager, tenantId, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.fromWarehouseId,
        binId: dto.fromBinId,
        batchId: dto.batchId,
        quantity: -dto.quantity,
      });

      // 3. Update Destination Balance
      await this.updateInventoryBalance(manager, tenantId, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.toWarehouseId,
        binId: dto.toBinId,
        batchId: dto.batchId,
        quantity: dto.quantity,
      });

      // 4. Create Stock Movements
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
    const tenantId = this.cls.get('tenantId');
    return this.dataSource.transaction(async (manager) => {
      const batch = await manager.findOne(Batch, {
        where: { id: dto.batchId },
      });
      if (!batch) throw new NotFoundException('Batch not found');

      // Update Global Batch Total
      batch.remainingQuantity =
        Number(batch.remainingQuantity) + dto.adjustmentQuantity;
      await manager.save(batch);

      // Update Warehouse Balance
      await this.updateInventoryBalance(manager, tenantId, {
        productId: dto.productId,
        variantId: dto.variantId,
        warehouseId: dto.warehouseId,
        binId: dto.binId,
        batchId: batch.id,
        quantity: dto.adjustmentQuantity,
      });

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

  async getStockLevels(productId?: string, warehouseId?: string) {
    const tenantId = this.cls.get('tenantId');
    const query = this.inventoryRepo
      .createQueryBuilder('inv')
      .where('inv.tenantId = :tenantId', { tenantId });

    if (productId) {
      query.andWhere('inv.productId = :productId', { productId });
    }
    if (warehouseId) {
      query.andWhere('inv.warehouseId = :warehouseId', { warehouseId });
    }

    return query
      .leftJoinAndSelect('inv.product', 'product')
      .leftJoinAndSelect('inv.warehouse', 'warehouse')
      .leftJoinAndSelect('inv.batch', 'batch')
      .getMany();
  }

  async startStockCount(warehouseId: string, notes?: string) {
    const tenantId = this.cls.get('tenantId');
    return this.dataSource.transaction(async (manager) => {
      const stockCount = manager.create(StockCount, {
        tenantId,
        warehouseId,
        notes,
        status: 'IN_PROGRESS' as any,
        startedAt: new Date(),
      });
      const savedCount = await manager.save(stockCount);

      // Populate items with expected quantities from warehouse-specific inventory
      const inventoryItems = await manager
        .createQueryBuilder(Inventory, 'inv')
        .where('inv.warehouseId = :whid', { whid: warehouseId })
        .andWhere('inv.tenantId = :tenantId', { tenantId })
        .andWhere('inv.quantity > 0')
        .getMany();

      for (const item of inventoryItems) {
        const countItem = manager.create(StockCountItem, {
          tenantId,
          stockCountId: savedCount.id,
          productId: item.productId,
          variantId: item.variantId,
          batchId: item.batchId,
          expectedQuantity: item.quantity,
          actualQuantity: item.quantity, // Default to expected
        });
        await manager.save(countItem);
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

  async getInventoryAging(warehouseId?: string) {
    const tenantId = this.cls.get('tenantId');
    const now = new Date();
    const query = this.inventoryRepo
      .createQueryBuilder('inv')
      .innerJoin('inv.batch', 'b')
      .where('inv.tenantId = :tenantId', { tenantId })
      .andWhere('inv.quantity > 0');

    if (warehouseId) {
      query.andWhere('inv.warehouseId = :warehouseId', { warehouseId });
    }

    const result = await query
      .select('inv.productId', 'productId')
      .addSelect(
        'SUM(CASE WHEN b.receivedDate > :thirtyDays THEN inv.quantity ELSE 0 END)',
        '0_30_days',
      )
      .addSelect(
        'SUM(CASE WHEN b.receivedDate <= :thirtyDays AND b.receivedDate > :sixtyDays THEN inv.quantity ELSE 0 END)',
        '31_60_days',
      )
      .addSelect(
        'SUM(CASE WHEN b.receivedDate <= :sixtyDays AND b.receivedDate > :ninetyDays THEN inv.quantity ELSE 0 END)',
        '61_90_days',
      )
      .addSelect(
        'SUM(CASE WHEN b.receivedDate <= :ninetyDays THEN inv.quantity ELSE 0 END)',
        'over_90_days',
      )
      .setParameters({
        thirtyDays: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        sixtyDays: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        ninetyDays: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      })
      .groupBy('inv.productId')
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

  async checkExpiryDates() {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    );

    const nearExpiryBatches = await this.batchRepo
      .createQueryBuilder('b')
      .where('b.remainingQuantity > 0')
      .andWhere('b.expiryDate IS NOT NULL')
      .andWhere('b.expiryDate <= :thirtyDays', {
        thirtyDays: thirtyDaysFromNow,
      })
      .getMany();

    const alerts = nearExpiryBatches.map((batch) => ({
      batchId: batch.id,
      productId: batch.productId,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      remainingQuantity: batch.remainingQuantity,
    }));

    if (alerts.length > 0) {
      this.logger.warn(`Found ${alerts.length} batches nearing expiry`);
    }

    return alerts;
  }

  async getStockValuation(warehouseId?: string) {
    const tenantId = this.cls.get('tenantId');
    const query = this.inventoryRepo
      .createQueryBuilder('inv')
      .innerJoin('inv.batch', 'b')
      .innerJoin('inv.product', 'product')
      .where('inv.tenantId = :tenantId', { tenantId })
      .andWhere('inv.quantity > 0');

    if (warehouseId) {
      query.andWhere('inv.warehouseId = :warehouseId', { warehouseId });
    }

    const valuation = await query
      .select('product.id', 'productId')
      .addSelect('product.name', 'productName')
      .addSelect('product.sku', 'sku')
      .addSelect('SUM(inv.quantity)', 'totalQuantity')
      .addSelect('SUM(inv.quantity * b.unitCost)', 'totalValue')
      .groupBy('product.id, product.name, product.sku')
      .getRawMany();

    const grandTotal = valuation.reduce(
      (sum, item) => sum + Number(item.totalValue),
      0,
    );

    return {
      items: valuation,
      grandTotal,
    };
  }

  async generateBarcode(productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Mock ZPL generation for thermal printers
    const barcodeData = product.barcode || product.sku;
    const zpl = `^XA\n^FO50,50^ADN,36,20^FD${product.name}^FS\n^FO50,100^BCN,100,Y,N,N^FD${barcodeData}^FS\n^XZ`;

    return {
      productId: product.id,
      zpl,
    };
  }
}
