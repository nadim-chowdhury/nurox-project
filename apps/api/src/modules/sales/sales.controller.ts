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
  UseInterceptors,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesOrderFlowService } from './sales-order-flow.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  createLeadSchema,
  updateLeadSchema,
  createDealSchema,
  updateDealSchema,
  createAccountSchema,
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
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Sales Management')
@ApiBearerAuth()
@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard, TenantGuard)
@CheckModule('sales')
@UseInterceptors(AuditLogInterceptor)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly salesOrderFlow: SalesOrderFlowService,
  ) {}

  @Post('leads')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  @ApiOperation({ summary: 'Create a new lead' })
  @UsePipes(new ZodValidationPipe(createLeadSchema))
  createLead(@Body() dto: CreateLeadDto) {
    return this.salesService.createLead(dto as any);
  }

  @Get('leads')
  @RequirePermissions(Permission.SALES_VIEW_LEADS)
  @ApiOperation({ summary: 'List all leads' })
  findAllLeads() {
    return this.salesService.findAllLeads();
  }

  @Get('leads/:id')
  @RequirePermissions(Permission.SALES_VIEW_LEADS)
  @ApiOperation({ summary: 'Get lead details' })
  findLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findLeadById(id);
  }

  @Patch('leads/:id')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  @ApiOperation({ summary: 'Update lead details' })
  @UsePipes(new ZodValidationPipe(updateLeadSchema))
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.salesService.updateLead(id, dto as any);
  }

  @Delete('leads/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  @ApiOperation({ summary: 'Delete a lead' })
  removeLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeLead(id);
  }

  @Post('deals')
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  @ApiOperation({ summary: 'Create a new deal' })
  @UsePipes(new ZodValidationPipe(createDealSchema))
  createDeal(@Body() dto: CreateDealDto) {
    return this.salesService.createDeal(dto as any);
  }

  @Get('deals')
  @RequirePermissions(Permission.SALES_VIEW_DEALS)
  @ApiOperation({ summary: 'List all deals' })
  findAllDeals() {
    return this.salesService.findAllDeals();
  }

  @Get('deals/:id')
  @RequirePermissions(Permission.SALES_VIEW_DEALS)
  @ApiOperation({ summary: 'Get deal details' })
  findDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findDealById(id);
  }

  @Patch('deals/:id')
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  @ApiOperation({ summary: 'Update deal details' })
  @UsePipes(new ZodValidationPipe(updateDealSchema))
  updateDeal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.salesService.updateDeal(id, dto as any);
  }

  @Delete('deals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  @ApiOperation({ summary: 'Delete a deal' })
  removeDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeDeal(id);
  }

  @Post('leads/:id/score')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  @ApiOperation({ summary: 'Calculate lead score' })
  calculateLeadScore(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.calculateLeadScore(id);
  }

  @Post('leads/:id/assign')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  @ApiOperation({ summary: 'Assign lead to users' })
  assignLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.salesService.assignLeadRoundRobin(id, userIds);
  }

  @Post('accounts')
  @ApiOperation({ summary: 'Create a new account' })
  @UsePipes(new ZodValidationPipe(createAccountSchema))
  createAccount(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateAccountDto,
  ) {
    return this.salesOrderFlow.createAccount(tenantId, dto);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'List all accounts' })
  listAccounts(@CurrentTenant() tenantId: string) {
    return this.salesOrderFlow.listAccounts(tenantId);
  }

  @Post('quotations')
  @ApiOperation({ summary: 'Create a new quotation' })
  @UsePipes(new ZodValidationPipe(createQuotationSchema))
  createQuotation(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateQuotationDto,
  ) {
    return this.salesOrderFlow.createQuotation(tenantId, dto);
  }

  @Get('quotations')
  @ApiOperation({ summary: 'List all quotations' })
  listQuotations(@CurrentTenant() tenantId: string) {
    return this.salesOrderFlow.listQuotations(tenantId);
  }

  @Get('quotations/:id')
  @ApiOperation({ summary: 'Get quotation details' })
  getQuotation(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.getQuotation(tenantId, id);
  }

  @Post('quotations/:id/send')
  @ApiOperation({ summary: 'Send quotation to customer' })
  sendQuotation(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.sendQuotation(tenantId, id);
  }

  @Post('quotations/:id/resend')
  @ApiOperation({ summary: 'Resend quotation' })
  resendQuotation(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.resendQuotation(id);
  }

  @Post('quotations/:id/convert')
  @ApiOperation({ summary: 'Convert quotation to sales order' })
  convertQuotationToSO(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.convertQuotationToSalesOrder(tenantId, id);
  }

  @Get('sales-orders')
  @ApiOperation({ summary: 'List all sales orders' })
  listSalesOrders(@CurrentTenant() tenantId: string) {
    return this.salesOrderFlow.listSalesOrders(tenantId);
  }

  @Get('sales-orders/:id')
  @ApiOperation({ summary: 'Get sales order details' })
  getSalesOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.getSalesOrder(tenantId, id);
  }

  @Post('sales-orders/:id/confirm')
  @ApiOperation({ summary: 'Confirm sales order' })
  confirmSalesOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.salesOrderFlow.confirmSalesOrder(tenantId, id);
  }

  @Post('sales-orders/:id/create-invoice')
  @ApiOperation({ summary: 'Create invoice from sales order' })
  @UsePipes(new ZodValidationPipe(invoiceFromSalesOrderSchema))
  createInvoiceFromSalesOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InvoiceFromSalesOrderDto,
  ) {
    return this.salesOrderFlow.createInvoiceFromSalesOrder(tenantId, id, dto);
  }

  @Post('delivery-orders')
  @ApiOperation({ summary: 'Create a delivery order' })
  @UsePipes(new ZodValidationPipe(createDeliveryOrderSchema))
  createDeliveryOrder(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateDeliveryOrderDto,
  ) {
    return this.salesOrderFlow.createDeliveryOrder(tenantId, dto);
  }

  @Post('delivery-orders/:id/ship')
  @ApiOperation({ summary: 'Ship delivery order' })
  shipDeliveryOrder(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('warehouseId', ParseUUIDPipe) warehouseId: string,
  ) {
    return this.salesOrderFlow.shipDeliveryOrder(tenantId, id, warehouseId);
  }

  @Get('analytics/funnel')
  @ApiOperation({ summary: 'Get sales funnel analytics' })
  getSalesFunnelAnalytics() {
    return this.salesService.getSalesFunnelAnalytics();
  }
}
