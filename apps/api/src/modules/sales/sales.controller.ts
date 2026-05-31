import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesOrderFlowService } from './sales-order-flow.service';
import {
  createLeadSchema,
  updateLeadSchema,
  createDealSchema,
  updateDealSchema,
  createQuotationSchema,
  createSalesOrderSchema,
  invoiceFromSalesOrderSchema,
  createDeliveryOrderSchema,
  type CreateLeadDto,
  type UpdateLeadDto,
  type CreateDealDto,
  type UpdateDealDto,
  type CreateQuotationDto,
  type CreateAccountDto,
  type InvoiceFromSalesOrderDto,
  type CreateDeliveryOrderDto,
} from '@repo/shared-schemas';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { CheckModule } from '../../common/guards/module.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard, TenantGuard)
@CheckModule('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly salesOrderFlow: SalesOrderFlowService,
  ) {}

  @Post('leads')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  createLead(@Body() dto: CreateLeadDto) {
    const parsed = createLeadSchema.parse(dto);
    return this.salesService.createLead(parsed as any);
  }

  @Get('leads')
  @RequirePermissions(Permission.SALES_VIEW_LEADS)
  findAllLeads() {
    return this.salesService.findAllLeads();
  }

  @Get('leads/:id')
  @RequirePermissions(Permission.SALES_VIEW_LEADS)
  findLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findLeadById(id);
  }

  @Patch('leads/:id')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    const parsed = updateLeadSchema.parse(dto);
    return this.salesService.updateLead(id, parsed as any);
  }

  @Delete('leads/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  removeLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeLead(id);
  }

  @Post('deals')
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  createDeal(@Body() dto: CreateDealDto) {
    const parsed = createDealSchema.parse(dto);
    return this.salesService.createDeal(parsed as any);
  }

  @Get('deals')
  @RequirePermissions(Permission.SALES_VIEW_DEALS)
  findAllDeals() {
    return this.salesService.findAllDeals();
  }

  @Get('deals/:id')
  @RequirePermissions(Permission.SALES_VIEW_DEALS)
  findDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findDealById(id);
  }

  @Patch('deals/:id')
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  updateDeal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
  ) {
    const parsed = updateDealSchema.parse(dto);
    return this.salesService.updateDeal(id, parsed as any);
  }

  @Delete('deals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  removeDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeDeal(id);
  }

  // --- NEW ENDPOINTS ---
  @Post('leads/:id/score')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  calculateLeadScore(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.calculateLeadScore(id);
  }

  @Post('leads/:id/assign')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  assignLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.salesService.assignLeadRoundRobin(id, userIds);
  }

  @Post('accounts')
  @UsePipes(new ZodValidationPipe(createAccountSchema))
  createAccount(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.salesOrderFlow.createAccount(tenantId, dto);
  }

  @Get('accounts')
  listAccounts(@CurrentTenant() tenantId: string) {
    return this.salesOrderFlow.listAccounts(tenantId);
  }

  @Post('quotations')
  @UsePipes(new ZodValidationPipe(createQuotationSchema))
  createQuotation(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.salesOrderFlow.createQuotation(tenantId, dto);
  }

  @Get('quotations')
  listQuotations(@CurrentTenant() tenantId: string) {
    return this.salesOrderFlow.listQuotations(tenantId);
  }

  @Get('quotations/:id')
  getQuotation(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.getQuotation(tenantId, id);
  }

  @Post('quotations/:id/send')
  sendQuotation(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.sendQuotation(tenantId, id);
  }

  @Post('quotations/:id/resend')
  resendQuotation(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.resendQuotation(id);
  }

  @Post('quotations/:id/convert')
  convertQuotationToSO(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.convertQuotationToSalesOrder(tenantId, id);
  }

  @Get('sales-orders')
  listSalesOrders(@CurrentTenant() tenantId: string) {
    return this.salesOrderFlow.listSalesOrders(tenantId);
  }

  @Get('sales-orders/:id')
  getSalesOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.getSalesOrder(tenantId, id);
  }

  @Post('sales-orders/:id/confirm')
  confirmSalesOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.confirmSalesOrder(tenantId, id);
  }

  @Post('sales-orders/:id/create-invoice')
  @UsePipes(new ZodValidationPipe(invoiceFromSalesOrderSchema))
  createInvoiceFromSalesOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InvoiceFromSalesOrderDto,
  ) {
    return this.salesOrderFlow.createInvoiceFromSalesOrder(tenantId, id, dto);
  }

  @Post('delivery-orders')
  @UsePipes(new ZodValidationPipe(createDeliveryOrderSchema))
  createDeliveryOrder(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateDeliveryOrderDto,
  ) {
    return this.salesOrderFlow.createDeliveryOrder(tenantId, dto);
  }

  @Post('delivery-orders/:id/ship')
  shipDeliveryOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('warehouseId', ParseUUIDPipe) warehouseId: string,
  ) {
    return this.salesOrderFlow.shipDeliveryOrder(tenantId, id, warehouseId);
  }

  @Get('analytics/funnel')
  getSalesFunnelAnalytics() {
    return this.salesService.getSalesFunnelAnalytics();
  }
}
