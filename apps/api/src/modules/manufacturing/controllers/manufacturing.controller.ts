import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ManufacturingService } from '../services/manufacturing.service';
import {
  CreateBomDto,
  CreateWorkOrderDto,
  LogProductionDto,
  createBomSchema,
  createWorkOrderSchema,
  logProductionSchema,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('manufacturing')
export class ManufacturingController {
  constructor(private readonly mfgService: ManufacturingService) {}

  @Post('boms')
  @UsePipes(new ZodValidationPipe(createBomSchema))
  async createBom(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateBomDto,
  ) {
    return this.mfgService.createBom(tenantId, dto);
  }

  @Post('work-orders')
  @UsePipes(new ZodValidationPipe(createWorkOrderSchema))
  async createWorkOrder(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateWorkOrderDto,
  ) {
    return this.mfgService.createWorkOrder(tenantId, dto);
  }

  @Post('work-orders/:id/release')
  async releaseWorkOrder(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.mfgService.releaseWorkOrder(tenantId, id);
  }

  @Post('work-orders/:id/log-production')
  @UsePipes(new ZodValidationPipe(logProductionSchema))
  async logProduction(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: LogProductionDto,
  ) {
    return this.mfgService.logProduction(tenantId, user.id, dto);
  }

  @Post('work-orders/:id/complete')
  async completeWorkOrder(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.mfgService.completeWorkOrder(tenantId, id);
  }

  @Get('analytics')
  async getAnalytics(@CurrentTenant() tenantId: string) {
    return this.mfgService.getAnalytics(tenantId);
  }
}
