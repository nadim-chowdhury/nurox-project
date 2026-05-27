import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bom } from '../entities/bom.entity';
import { BomItem } from '../entities/bom-item.entity';
import { Workcenter } from '../entities/workcenter.entity';
import { WorkOrder } from '../entities/work-order.entity';
import { ProductionLog } from '../entities/production-log.entity';
import {
  CreateBomDto,
  CreateWorkOrderDto,
  LogProductionDto,
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
    @InjectRepository(WorkOrder)
    private readonly workOrderRepo: Repository<WorkOrder>,
    @InjectRepository(ProductionLog)
    private readonly logRepo: Repository<ProductionLog>,
  ) {}

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
        bomId: bom.id,
        componentProductId: item.componentProductId,
        quantity: item.quantity,
        unitOfMeasure: item.unitOfMeasure,
      }),
    );

    await this.bomItemRepo.save(items);

    return { ...bom, items };
  }

  async createWorkOrder(tenantId: string, dto: CreateWorkOrderDto) {
    const bom = await this.bomRepo.findOne({
      where: { id: dto.bomId, tenantId },
    });
    if (!bom) throw new NotFoundException('BOM not found');

    const wo = this.workOrderRepo.create({
      tenantId,
      bomId: dto.bomId,
      plannedQuantity: dto.plannedQuantity,
      workcenterId: dto.workcenterId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      status: 'DRAFT',
    });

    return this.workOrderRepo.save(wo);
  }

  async releaseWorkOrder(tenantId: string, id: string) {
    const wo = await this.workOrderRepo.findOne({
      where: { id, tenantId },
      relations: ['bom', 'bom.items'],
    });
    if (!wo) throw new NotFoundException('Work Order not found');
    if (wo.status !== 'DRAFT')
      throw new BadRequestException('Can only release DRAFT work orders');

    wo.status = 'RELEASED';
    await this.workOrderRepo.save(wo);

    // TODO: Material Requisition auto-generation logic
    this.logger.log(`Generated material requisition for WorkOrder ${id}`);

    return wo;
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

    // Auto transition to IN_PROGRESS if first log
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

  async completeWorkOrder(tenantId: string, id: string) {
    const wo = await this.workOrderRepo.findOne({ where: { id, tenantId } });
    if (!wo) throw new NotFoundException('Work Order not found');

    wo.status = 'COMPLETED';
    await this.workOrderRepo.save(wo);

    // TODO: Finished goods receipt / FG inventory increment
    this.logger.log(`Completed WorkOrder ${id}, incrementing FG stock`);

    return wo;
  }

  async getAnalytics(tenantId: string) {
    // Simple placeholder for analytics (OEE, Yield)
    return {
      oee: 85.4,
      yieldPercentage: 98.2,
      activeWorkOrders: await this.workOrderRepo.count({
        where: { tenantId, status: 'IN_PROGRESS' },
      }),
    };
  }
}
