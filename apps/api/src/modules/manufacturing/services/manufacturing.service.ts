import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
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
import {
  CreateBomDto,
  CreateWorkOrderDto,
  CreateWorkcenterDto,
  CreateMachineDto,
  LogProductionDto,
  CompleteWorkOrderDto,
} from '@repo/shared-schemas';

@Injectable()
export class ManufacturingService {
  private readonly logger = new Logger(ManufacturingService.name);

  constructor(
    @InjectRepository(Bom) private readonly bomRepo: Repository<Bom>,
    @InjectRepository(BomItem)
    private readonly bomItemRepo: Repository<BomItem>,
    @InjectRepository(Workcenter)
    private readonly workcenterRepo: Repository<Workcenter>,
    @InjectRepository(Machine)
    private readonly machineRepo: Repository<Machine>,
    @InjectRepository(WorkOrder)
    private readonly workOrderRepo: Repository<WorkOrder>,
    @InjectRepository(WorkOrderStage)
    private readonly stageRepo: Repository<WorkOrderStage>,
    @InjectRepository(ProductionLog)
    private readonly logRepo: Repository<ProductionLog>,
    private readonly inventoryService: InventoryService,
  ) {}

  async createWorkcenter(tenantId: string, dto: CreateWorkcenterDto) {
    const wc = this.workcenterRepo.create({ tenantId, ...dto });
    return this.workcenterRepo.save(wc);
  }

  async listWorkcenters(tenantId: string) {
    return this.workcenterRepo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
  }

  async createMachine(tenantId: string, dto: CreateMachineDto) {
    const wc = await this.workcenterRepo.findOne({
      where: { id: dto.workcenterId, tenantId },
    });
    if (!wc) throw new NotFoundException('Work center not found');

    const machine = this.machineRepo.create({
      tenantId,
      workcenterId: dto.workcenterId,
      code: dto.code,
      name: dto.name,
      capacityPerHour: dto.capacityPerHour ?? null,
      status: MachineStatus.AVAILABLE,
    });
    return this.machineRepo.save(machine);
  }

  async listMachines(tenantId: string, workcenterId?: string) {
    return this.machineRepo.find({
      where: workcenterId ? { tenantId, workcenterId } : { tenantId },
      order: { code: 'ASC' },
    });
  }

  async createBom(tenantId: string, dto: CreateBomDto) {
    const bom = this.bomRepo.create({
      tenantId,
      finishedProductId: dto.finishedProductId,
      version: dto.version,
      isActive: dto.isActive,
    });

    await this.bomRepo.save(bom);

    const items = dto.items.map((item) =>
      this.bomItemRepo.create({
        tenantId,
        bomId: bom.id,
        componentProductId: item.componentProductId,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
      }),
    );

    await this.bomItemRepo.save(items);

    return { ...bom, items };
  }

  async listBoms(tenantId: string) {
    return this.bomRepo.find({
      where: { tenantId },
      relations: ['items', 'finishedProduct'],
      order: { createdAt: 'DESC' },
    });
  }

  private buildDefaultStages(
    tenantId: string,
    workOrderId: string,
    dto: CreateWorkOrderDto,
  ): Partial<WorkOrderStage>[] {
    const workcenterId = dto.workcenterId ?? dto.stages?.[0]?.workcenterId;
    if (!workcenterId) {
      throw new BadRequestException(
        'workcenterId or stages[0].workcenterId is required',
      );
    }
    return [
      {
        tenantId,
        workOrderId,
        sequence: 1,
        name: 'Production',
        workcenterId,
        machineId: dto.stages?.[0]?.machineId ?? null,
        scheduledMinutes: dto.stages?.[0]?.scheduledMinutes ?? 0,
        plannedStartAt: dto.stages?.[0]?.plannedStartAt
          ? new Date(dto.stages[0].plannedStartAt)
          : null,
        plannedEndAt: dto.stages?.[0]?.plannedEndAt
          ? new Date(dto.stages[0].plannedEndAt)
          : null,
        consumesBom: true,
        status: WorkOrderStageStatus.PENDING,
      },
    ];
  }

  async createWorkOrder(tenantId: string, dto: CreateWorkOrderDto) {
    const bom = await this.bomRepo.findOne({
      where: { id: dto.bomId, tenantId },
      relations: ['items'],
    });
    if (!bom) throw new NotFoundException('BOM not found');
    if (!bom.items?.length) {
      throw new BadRequestException('BOM has no component lines');
    }

    const wo = this.workOrderRepo.create({
      tenantId,
      bomId: dto.bomId,
      warehouseId: dto.warehouseId,
      plannedQuantity: dto.plannedQuantity,
      workcenterId: dto.workcenterId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: 'DRAFT',
    });

    await this.workOrderRepo.save(wo);

    const stageDefs =
      dto.stages && dto.stages.length > 0
        ? dto.stages.map((s) => ({
            tenantId,
            workOrderId: wo.id,
            sequence: s.sequence,
            name: s.name,
            workcenterId: s.workcenterId,
            machineId: s.machineId ?? null,
            scheduledMinutes: s.scheduledMinutes ?? 0,
            plannedStartAt: s.plannedStartAt
              ? new Date(s.plannedStartAt)
              : null,
            plannedEndAt: s.plannedEndAt ? new Date(s.plannedEndAt) : null,
            consumesBom: s.consumesBom ?? s.sequence === 1,
            status: WorkOrderStageStatus.PENDING,
          }))
        : this.buildDefaultStages(tenantId, wo.id, dto);

    const hasBomConsumer = stageDefs.some((s) => s.consumesBom);
    if (!hasBomConsumer) {
      (stageDefs[0] as Partial<WorkOrderStage>).consumesBom = true;
    }

    const stages = this.stageRepo.create(stageDefs as WorkOrderStage[]);
    await this.stageRepo.save(stages);

    return this.getWorkOrder(tenantId, wo.id);
  }

  async getWorkOrder(tenantId: string, id: string) {
    const wo = await this.workOrderRepo.findOne({
      where: { id, tenantId },
      relations: [
        'bom',
        'bom.items',
        'stages',
        'stages.workcenter',
        'stages.machine',
      ],
      order: { stages: { sequence: 'ASC' } },
    });
    if (!wo) throw new NotFoundException('Work Order not found');
    if (wo.stages) {
      wo.stages.sort((a, b) => a.sequence - b.sequence);
    }
    return wo;
  }

  async listWorkOrders(tenantId: string) {
    return this.workOrderRepo.find({
      where: { tenantId },
      relations: ['stages'],
      order: { createdAt: 'DESC' },
    });
  }

  async releaseWorkOrder(tenantId: string, id: string) {
    const wo = await this.getWorkOrder(tenantId, id);
    if (wo.status !== 'DRAFT') {
      throw new BadRequestException('Can only release DRAFT work orders');
    }
    if (!wo.stages?.length) {
      throw new BadRequestException('Work order has no production stages');
    }

    wo.status = 'RELEASED';
    await this.workOrderRepo.save(wo);

    for (const stage of wo.stages) {
      if (stage.status === WorkOrderStageStatus.PENDING) {
        stage.status = WorkOrderStageStatus.SCHEDULED;
        await this.stageRepo.save(stage);
      }
    }

    return this.getWorkOrder(tenantId, id);
  }

  private async assertMachineAvailable(
    tenantId: string,
    machineId: string,
    excludeStageId?: string,
  ) {
    const activeOnMachine = await this.stageRepo.findOne({
      where: {
        tenantId,
        machineId,
        status: WorkOrderStageStatus.IN_PROGRESS,
        ...(excludeStageId ? { id: Not(excludeStageId) } : {}),
      },
    });
    if (activeOnMachine) {
      throw new BadRequestException(
        `Machine is already in use by stage ${activeOnMachine.id}`,
      );
    }

    const machine = await this.machineRepo.findOne({
      where: { id: machineId, tenantId },
    });
    if (!machine) throw new NotFoundException('Machine not found');
    if (machine.status === MachineStatus.MAINTENANCE) {
      throw new BadRequestException('Machine is under maintenance');
    }
    if (machine.status === MachineStatus.OFFLINE) {
      throw new BadRequestException('Machine is offline');
    }
  }

  private async consumeBomForStage(
    wo: WorkOrder,
    stage: WorkOrderStage,
  ): Promise<void> {
    if (!stage.consumesBom || stage.materialsConsumed) return;

    const items = wo.bom?.items ?? [];
    if (!items.length) {
      throw new BadRequestException('BOM has no components to consume');
    }

    const plannedQty = Number(wo.plannedQuantity);

    for (const item of items) {
      const qty = Number(item.quantity) * plannedQty;
      await this.inventoryService.issueStock({
        productId: item.componentProductId,
        warehouseId: wo.warehouseId,
        quantity: qty,
        reference: `WO-${wo.id}-STAGE-${stage.sequence}`,
        reasonCode: 'MANUFACTURING_CONSUMPTION',
      });
    }

    stage.materialsConsumed = true;
    await this.stageRepo.save(stage);
    this.logger.log(
      `Issued BOM materials for WO ${wo.id} stage ${stage.sequence}`,
    );
  }

  async startStage(tenantId: string, workOrderId: string, stageId: string) {
    const wo = await this.getWorkOrder(tenantId, workOrderId);

    if (!['RELEASED', 'IN_PROGRESS'].includes(wo.status)) {
      throw new BadRequestException(
        'Work order must be RELEASED or IN_PROGRESS to start a stage',
      );
    }

    const stage = wo.stages.find((s) => s.id === stageId);
    if (!stage) throw new NotFoundException('Stage not found');

    if (
      stage.status !== WorkOrderStageStatus.SCHEDULED &&
      stage.status !== WorkOrderStageStatus.PENDING
    ) {
      throw new BadRequestException(
        `Cannot start stage in status ${stage.status}`,
      );
    }

    const priorIncomplete = wo.stages.filter(
      (s) =>
        s.sequence < stage.sequence &&
        s.status !== WorkOrderStageStatus.COMPLETED &&
        s.status !== WorkOrderStageStatus.SKIPPED,
    );
    if (priorIncomplete.length > 0) {
      throw new BadRequestException(
        'Previous stages must be completed or skipped first',
      );
    }

    if (stage.machineId) {
      await this.assertMachineAvailable(tenantId, stage.machineId, stage.id);
      const machine = await this.machineRepo.findOne({
        where: { id: stage.machineId, tenantId },
      });
      if (machine) {
        machine.status = MachineStatus.IN_USE;
        await this.machineRepo.save(machine);
      }
    }

    await this.consumeBomForStage(wo, stage);

    stage.status = WorkOrderStageStatus.IN_PROGRESS;
    stage.actualStartAt = new Date();
    await this.stageRepo.save(stage);

    if (wo.status === 'RELEASED') {
      wo.status = 'IN_PROGRESS';
      await this.workOrderRepo.save(wo);
    }

    return this.getWorkOrder(tenantId, workOrderId);
  }

  async completeStage(tenantId: string, workOrderId: string, stageId: string) {
    const wo = await this.getWorkOrder(tenantId, workOrderId);
    const stage = wo.stages.find((s) => s.id === stageId);
    if (!stage) throw new NotFoundException('Stage not found');

    if (stage.status !== WorkOrderStageStatus.IN_PROGRESS) {
      throw new BadRequestException('Stage is not in progress');
    }

    stage.status = WorkOrderStageStatus.COMPLETED;
    stage.actualEndAt = new Date();
    await this.stageRepo.save(stage);

    if (stage.machineId) {
      const machine = await this.machineRepo.findOne({
        where: { id: stage.machineId, tenantId },
      });
      if (machine) {
        machine.status = MachineStatus.AVAILABLE;
        await this.machineRepo.save(machine);
      }
    }

    return this.getWorkOrder(tenantId, workOrderId);
  }

  async logProduction(
    tenantId: string,
    employeeId: string,
    dto: LogProductionDto,
  ) {
    const wo = await this.workOrderRepo.findOne({
      where: { id: dto.workOrderId, tenantId },
    });
    if (!wo) throw new NotFoundException('Work Order not found');

    if (wo.status === 'RELEASED') {
      wo.status = 'IN_PROGRESS';
    }

    const log = this.logRepo.create({
      tenantId,
      workOrderId: wo.id,
      loggedById: employeeId,
      completedQuantity: dto.completedQuantity,
      scrapQuantity: dto.scrapQuantity,
      scrapReason: dto.scrapReason,
      laborHours: dto.laborHours,
      machineHours: dto.machineHours,
    });

    await this.logRepo.save(log);

    wo.completedQuantity = Number(wo.completedQuantity) + dto.completedQuantity;
    wo.scrapQuantity = Number(wo.scrapQuantity) + dto.scrapQuantity;

    await this.workOrderRepo.save(wo);

    return log;
  }

  async completeWorkOrder(
    tenantId: string,
    id: string,
    dto: CompleteWorkOrderDto = {},
  ) {
    const wo = await this.getWorkOrder(tenantId, id);

    if (!['IN_PROGRESS', 'RELEASED'].includes(wo.status)) {
      throw new BadRequestException(
        'Work order must be IN_PROGRESS or RELEASED to complete',
      );
    }

    const openStages = wo.stages.filter(
      (s) =>
        s.status !== WorkOrderStageStatus.COMPLETED &&
        s.status !== WorkOrderStageStatus.SKIPPED,
    );
    if (openStages.length > 0) {
      throw new BadRequestException(
        'All stages must be completed or skipped before closing the work order',
      );
    }

    const fgQty = Number(wo.completedQuantity);
    if (fgQty <= 0) {
      throw new BadRequestException(
        'Log production output before completing the work order',
      );
    }

    const unitCost = dto.unitCost ?? 0;
    await this.inventoryService.receiveStock({
      productId: wo.bom.finishedProductId,
      warehouseId: wo.warehouseId,
      batchNumber: `WO-${wo.id}`,
      quantity: fgQty,
      unitCost,
      reference: `WO-${wo.id}-FG-RECEIPT`,
    });

    wo.status = 'COMPLETED';
    await this.workOrderRepo.save(wo);

    this.logger.log(`Completed WO ${id} — received ${fgQty} FG units`);

    return this.getWorkOrder(tenantId, id);
  }

  async getAnalytics(tenantId: string) {
    const activeWorkOrders = await this.workOrderRepo.count({
      where: { tenantId, status: 'IN_PROGRESS' },
    });
    const activeStages = await this.stageRepo.count({
      where: { tenantId, status: WorkOrderStageStatus.IN_PROGRESS },
    });

    return {
      oee: 85.4,
      yieldPercentage: 98.2,
      activeWorkOrders,
      activeStages,
    };
  }
}
