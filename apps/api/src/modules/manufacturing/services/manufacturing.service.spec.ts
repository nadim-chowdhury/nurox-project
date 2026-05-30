import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ManufacturingService } from './manufacturing.service';
import { Bom } from '../entities/bom.entity';
import { BomItem } from '../entities/bom-item.entity';
import { Workcenter } from '../entities/workcenter.entity';
import { Machine, MachineStatus } from '../entities/machine.entity';
import { WorkOrder } from '../entities/work-order.entity';
import {
  WorkOrderStage,
  WorkOrderStageStatus,
} from '../entities/work-order-stage.entity';
import { ProductionLog } from '../entities/production-log.entity';
import { InventoryService } from '../../inventory/inventory.service';

describe('ManufacturingService', () => {
  let service: ManufacturingService;
  let workOrderRepo: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let stageRepo: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let bomRepo: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };
  let inventoryService: { issueStock: jest.Mock; receiveStock: jest.Mock };

  const tenantId = 'd3b07384-d113-4c4e-9c8e-cf00257e8412';
  const warehouseId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  const bomId = 'b1b2c3d4-e5f6-7890-abcd-ef1234567891';
  const workcenterId = 'c1b2c3d4-e5f6-7890-abcd-ef1234567892';

  const mockRepo = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn((entity) =>
      Promise.resolve({ ...entity, id: entity.id ?? 'new-id' }),
    ),
    create: jest.fn((dto) => dto),
    count: jest.fn().mockResolvedValue(0),
  });

  beforeEach(async () => {
    workOrderRepo = mockRepo();
    stageRepo = mockRepo();
    bomRepo = mockRepo();
    inventoryService = {
      issueStock: jest.fn().mockResolvedValue([]),
      receiveStock: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManufacturingService,
        { provide: getRepositoryToken(Bom), useValue: bomRepo },
        { provide: getRepositoryToken(BomItem), useValue: mockRepo() },
        { provide: getRepositoryToken(Workcenter), useValue: mockRepo() },
        { provide: getRepositoryToken(Machine), useValue: mockRepo() },
        { provide: getRepositoryToken(WorkOrder), useValue: workOrderRepo },
        { provide: getRepositoryToken(WorkOrderStage), useValue: stageRepo },
        { provide: getRepositoryToken(ProductionLog), useValue: mockRepo() },
        { provide: InventoryService, useValue: inventoryService },
      ],
    }).compile();

    service = module.get(ManufacturingService);
  });

  describe('createWorkOrder', () => {
    it('creates work order with default single stage consuming BOM', async () => {
      bomRepo.findOne.mockResolvedValue({
        id: bomId,
        tenantId,
        items: [{ componentProductId: 'comp-1', quantity: 2 }],
      });
      workOrderRepo.save.mockImplementation((wo) =>
        Promise.resolve({ ...wo, id: 'wo-1' }),
      );
      stageRepo.create.mockImplementation((stages) => stages);
      stageRepo.save.mockResolvedValue(undefined);
      workOrderRepo.findOne.mockResolvedValue({
        id: 'wo-1',
        tenantId,
        warehouseId,
        plannedQuantity: 10,
        status: 'DRAFT',
        bom: { items: [{ componentProductId: 'comp-1', quantity: 2 }] },
        stages: [
          {
            id: 'stage-1',
            sequence: 1,
            consumesBom: true,
            materialsConsumed: false,
            status: WorkOrderStageStatus.PENDING,
          },
        ],
      });

      const result = await service.createWorkOrder(tenantId, {
        bomId,
        warehouseId,
        plannedQuantity: 10,
        workcenterId,
      });

      expect(stageRepo.save).toHaveBeenCalled();
      expect(result.id).toBe('wo-1');
    });

    it('throws when BOM is missing', async () => {
      bomRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createWorkOrder(tenantId, {
          bomId,
          warehouseId,
          plannedQuantity: 1,
          workcenterId,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('startStage', () => {
    it('issues BOM components when stage consumes materials', async () => {
      const wo = {
        id: 'wo-1',
        tenantId,
        warehouseId,
        plannedQuantity: 5,
        status: 'RELEASED',
        bom: {
          finishedProductId: 'fg-1',
          items: [{ componentProductId: 'comp-1', quantity: 2 }],
        },
        stages: [
          {
            id: 'stage-1',
            sequence: 1,
            status: WorkOrderStageStatus.SCHEDULED,
            consumesBom: true,
            materialsConsumed: false,
            machineId: null,
          },
        ],
      };
      workOrderRepo.findOne.mockResolvedValue(wo);
      stageRepo.save.mockImplementation((s) => Promise.resolve(s));

      await service.startStage(tenantId, 'wo-1', 'stage-1');

      expect(inventoryService.issueStock).toHaveBeenCalledWith({
        productId: 'comp-1',
        warehouseId,
        quantity: 10,
        reference: 'WO-wo-1-STAGE-1',
        reasonCode: 'MANUFACTURING_CONSUMPTION',
      });
    });

    it('blocks start when prior stage is incomplete', async () => {
      workOrderRepo.findOne.mockResolvedValue({
        id: 'wo-1',
        tenantId,
        warehouseId,
        plannedQuantity: 1,
        status: 'RELEASED',
        bom: { items: [] },
        stages: [
          {
            id: 'stage-1',
            sequence: 1,
            status: WorkOrderStageStatus.SCHEDULED,
            consumesBom: true,
            materialsConsumed: false,
          },
          {
            id: 'stage-2',
            sequence: 2,
            status: WorkOrderStageStatus.SCHEDULED,
            consumesBom: false,
            materialsConsumed: false,
          },
        ],
      });

      await expect(
        service.startStage(tenantId, 'wo-1', 'stage-2'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeWorkOrder', () => {
    it('receives finished goods into inventory', async () => {
      workOrderRepo.findOne.mockResolvedValue({
        id: 'wo-1',
        tenantId,
        warehouseId,
        status: 'IN_PROGRESS',
        completedQuantity: 8,
        bom: { finishedProductId: 'fg-1', items: [] },
        stages: [
          {
            id: 'stage-1',
            status: WorkOrderStageStatus.COMPLETED,
          },
        ],
      });
      workOrderRepo.save.mockImplementation((wo) => Promise.resolve(wo));

      await service.completeWorkOrder(tenantId, 'wo-1', { unitCost: 12.5 });

      expect(inventoryService.receiveStock).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'fg-1',
          warehouseId,
          quantity: 8,
          unitCost: 12.5,
        }),
      );
    });
  });
});
