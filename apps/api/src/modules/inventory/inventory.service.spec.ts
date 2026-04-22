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
import { getQueueToken } from '@nestjs/bullmq';
import { DataSource } from 'typeorm';

describe('InventoryService', () => {
  let service: InventoryService;

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
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
