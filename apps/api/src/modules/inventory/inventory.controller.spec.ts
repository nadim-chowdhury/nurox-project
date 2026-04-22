import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: {
            createProduct: jest.fn(),
            createVariant: jest.fn(),
            createWarehouse: jest.fn(),
            createZone: jest.fn(),
            createRack: jest.fn(),
            createBin: jest.fn(),
            receiveStock: jest.fn(),
            issueStock: jest.fn(),
            transferStock: jest.fn(),
            adjustStock: jest.fn(),
            getStockLevels: jest.fn(),
            startStockCount: jest.fn(),
            completeStockCount: jest.fn(),
            getInventoryAging: jest.fn(),
            checkReorderPoints: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
