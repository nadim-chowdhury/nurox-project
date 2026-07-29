import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Warehouse } from './entities/warehouse.entity';
import { Zone } from './entities/zone.entity';
import { Rack } from './entities/rack.entity';
import { Bin } from './entities/bin.entity';
import { Batch } from './entities/batch.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { Inventory } from './entities/inventory.entity';
import { getQueueToken } from '@nestjs/bullmq';
import { DataSource } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('InventoryService', () => {
  let service: InventoryService;
  let dataSource: DataSource;

  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getMany: jest.fn(),
      getRawOne: jest.fn(),
      getRawMany: jest.fn(),
    })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getRepositoryToken(Product), useFactory: mockRepository },
        {
          provide: getRepositoryToken(ProductVariant),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Warehouse), useFactory: mockRepository },
        { provide: getRepositoryToken(Zone), useFactory: mockRepository },
        { provide: getRepositoryToken(Rack), useFactory: mockRepository },
        { provide: getRepositoryToken(Bin), useFactory: mockRepository },
        { provide: getRepositoryToken(Batch), useFactory: mockRepository },
        {
          provide: getRepositoryToken(StockMovement),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Inventory), useFactory: mockRepository },
        {
          provide: getQueueToken('inventory_alerts'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn().mockReturnValue('test-tenant'),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('receiveStock', () => {
    it('should create a batch and update inventory balance', async () => {
      const dto = {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        batchNumber: 'B001',
        quantity: 100,
        unitCost: 10,
      };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(null), // No existing batch, no existing inventory
        create: jest.fn((entity, data) => ({ id: 'new-id', ...data })),
        save: jest.fn((data) => Promise.resolve(data)),
        createQueryBuilder: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          getRawOne: jest.fn().mockResolvedValue({ total: 0, value: 0 }),
        })),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager),
      );

      await service.receiveStock(dto);

      expect(mockManager.create).toHaveBeenCalledWith(
        Batch,
        expect.any(Object),
      );
      expect(mockManager.create).toHaveBeenCalledWith(
        Inventory,
        expect.objectContaining({
          warehouseId: 'wh-1',
          quantity: 100,
        }),
      );
      expect(mockManager.create).toHaveBeenCalledWith(
        StockMovement,
        expect.any(Object),
      );
    });
  });

  describe('transferStock', () => {
    it('should update source and destination inventory balances', async () => {
      const dto = {
        productId: 'prod-1',
        fromWarehouseId: 'wh-1',
        toWarehouseId: 'wh-2',
        batchId: 'batch-1',
        quantity: 50,
      };

      const mockManager = {
        findOne: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'inv-1',
            quantity: 100,
            warehouseId: 'wh-1',
          }) // find source inventory
          .mockResolvedValueOnce({ id: 'batch-1', unitCost: 10 }) // find batch
          .mockResolvedValueOnce({
            id: 'inv-1',
            quantity: 100,
            warehouseId: 'wh-1',
          }) // find source inventory again in updateBalance
          .mockResolvedValueOnce({
            id: 'inv-2',
            quantity: 0,
            warehouseId: 'wh-2',
          }), // find dest inventory in updateBalance
        create: jest.fn((entity, data) => ({ id: 'new-id', ...data })),
        save: jest.fn((data) => Promise.resolve(data)),
      };

      (dataSource.transaction as jest.Mock).mockImplementation(async (cb) =>
        cb(mockManager),
      );

      await service.transferStock(dto);

      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          warehouseId: 'wh-1',
          quantity: 50, // 100 - 50
        }),
      );
      expect(mockManager.save).toHaveBeenCalledWith(
        expect.objectContaining({
          warehouseId: 'wh-2',
          quantity: 50, // 0 + 50
        }),
      );
    });
  });
});
