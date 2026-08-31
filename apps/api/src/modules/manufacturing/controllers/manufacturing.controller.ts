import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ManufacturingService } from '../services/manufacturing.service';
import {
  CreateBomDto,
  CreateWorkOrderDto,
  CreateWorkcenterDto,
  CreateMachineDto,
  LogProductionDto,
  CompleteWorkOrderDto,
  createBomSchema,
  createWorkOrderSchema,
  createWorkcenterSchema,
  createMachineSchema,
  logProductionSchema,
  completeWorkOrderSchema,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CheckModule } from '../../../common/guards/module.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
@UseGuards(JwtAuthGuard, TenantGuard)
@CheckModule('manufacturing')
@Controller('manufacturing')
export class ManufacturingController {
  constructor(private readonly mfgService: ManufacturingService) {}

  @Post('workcenters')
  @UsePipes(new ZodValidationPipe(createWorkcenterSchema))
  createWorkcenter(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWorkcenterDto,
  ) {
    return this.mfgService.createWorkcenter(tenantId, dto);
  }

  @Get('workcenters')
  listWorkcenters(@CurrentTenant() tenantId: string) {
    return this.mfgService.listWorkcenters(tenantId);
  }

  @Post('machines')
  @UsePipes(new ZodValidationPipe(createMachineSchema))
  createMachine(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateMachineDto,
  ) {
    return this.mfgService.createMachine(tenantId, dto);
  }

  @Get('machines')
  listMachines(
    @CurrentTenant() tenantId: string,
    @Query('workcenterId') workcenterId?: string,
  ) {
    return this.mfgService.listMachines(tenantId, workcenterId);
  }

  @Post('boms')
  @UsePipes(new ZodValidationPipe(createBomSchema))
  createBom(@CurrentTenant() tenantId: string, @Body() dto: CreateBomDto) {
    return this.mfgService.createBom(tenantId, dto);
  }

  @Get('boms')
  listBoms(@CurrentTenant() tenantId: string) {
    return this.mfgService.listBoms(tenantId);
  }

  @Post('work-orders')
  @UsePipes(new ZodValidationPipe(createWorkOrderSchema))
  createWorkOrder(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.mfgService.createWorkOrder(tenantId, dto);
  }

  @Get('work-orders')
  listWorkOrders(@CurrentTenant() tenantId: string) {
    return this.mfgService.listWorkOrders(tenantId);
  }

  @Get('work-orders/:id')
  getWorkOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.mfgService.getWorkOrder(tenantId, id);
  }

  @Post('work-orders/:id/release')
  releaseWorkOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.mfgService.releaseWorkOrder(tenantId, id);
  }

  @Post('work-orders/:workOrderId/stages/:stageId/start')
  startStage(
    @CurrentTenant() tenantId: string,
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
  ) {
    return this.mfgService.startStage(tenantId, workOrderId, stageId);
  }

  @Post('work-orders/:workOrderId/stages/:stageId/complete')
  completeStage(
    @CurrentTenant() tenantId: string,
    @Param('workOrderId', ParseUUIDPipe) workOrderId: string,
    @Param('stageId', ParseUUIDPipe) stageId: string,
  ) {
    return this.mfgService.completeStage(tenantId, workOrderId, stageId);
  }

  @Post('work-orders/:id/log-production')
  @UsePipes(new ZodValidationPipe(logProductionSchema))
  logProduction(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: LogProductionDto,
  ) {
    return this.mfgService.logProduction(tenantId, user.id, dto);
  }

  @Post('work-orders/:id/complete')
  @UsePipes(new ZodValidationPipe(completeWorkOrderSchema))
  completeWorkOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteWorkOrderDto,
  ) {
    return this.mfgService.completeWorkOrder(tenantId, id, dto);
  }

  @Get('analytics')
  getAnalytics(@CurrentTenant() tenantId: string) {
    return this.mfgService.getAnalytics(tenantId);
  }
}
