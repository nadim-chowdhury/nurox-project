import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  UsePipes,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CheckModule } from '../../common/guards/module.guard';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';
import {
  vendorSchema,
  purchaseRequestSchema,
  rfqSchema,
  purchaseOrderSchema,
  grnSchema,
  vendorQuoteSchema,
  vendorBillSchema,
  VendorDto,
  PurchaseRequestDto,
  RfqDto,
  PurchaseOrderDto,
  GrnDto,
  VendorQuoteDto,
  CreateVendorBillDto,
  createVendorBillSchema,
} from '@repo/shared-schemas';
import { VendorBillStatus } from './entities/vendor-bill.entity';

@ApiTags('Procurement')
@ApiBearerAuth()
@Controller('procurement')
@UseGuards(JwtAuthGuard, TenantGuard)
@CheckModule('procurement')
@UseInterceptors(AuditLogInterceptor)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post('vendors')
  @ApiOperation({ summary: 'Create a new vendor' })
  @UsePipes(new ZodValidationPipe(vendorSchema))
  createVendor(@Body() dto: VendorDto) {
    return this.procurementService.createVendor(dto as any);
  }

  @Get('vendors')
  @ApiOperation({ summary: 'List all vendors' })
  findAllVendors() {
    return this.procurementService.findAllVendors();
  }

  @Post('purchase-requests')
  @ApiOperation({ summary: 'Create a purchase request' })
  @UsePipes(new ZodValidationPipe(purchaseRequestSchema))
  createPR(@Body() dto: PurchaseRequestDto) {
    return this.procurementService.createPR(dto as any);
  }

  @Post('rfqs')
  @ApiOperation({ summary: 'Create a request for quotation' })
  @UsePipes(new ZodValidationPipe(rfqSchema))
  createRFQ(@Body() dto: RfqDto) {
    return this.procurementService.createRFQ(dto as any);
  }

  @Get('rfqs/:id/comparison')
  @ApiOperation({ summary: 'Get RFQ comparison' })
  getRfqComparison(@Param('id') id: string) {
    return this.procurementService.getRfqComparison(id);
  }

  @Post('quotes')
  @ApiOperation({ summary: 'Submit a vendor quote' })
  @UsePipes(new ZodValidationPipe(vendorQuoteSchema))
  submitQuote(@Body() dto: VendorQuoteDto) {
    return this.procurementService.submitQuote(dto as any);
  }

  @Post('purchase-orders')
  @ApiOperation({ summary: 'Create a purchase order' })
  @UsePipes(new ZodValidationPipe(purchaseOrderSchema))
  createPO(@Body() dto: PurchaseOrderDto) {
    return this.procurementService.createPO(dto as any);
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'List all purchase orders' })
  findAllPOs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.procurementService.findAllPOs(page || 1, limit || 20);
  }

  @Post('purchase-orders/:id/send')
  @ApiOperation({ summary: 'Send PO to vendor' })
  sendPO(@Param('id') id: string) {
    return this.procurementService.sendPOByEmail(id);
  }

  @Patch('purchase-orders/:id/amend')
  @ApiOperation({ summary: 'Amend a purchase order' })
  amendPO(@Param('id') id: string, @Body() dto: any) {
    return this.procurementService.amendPO(id, dto);
  }

  @Post('grns')
  @ApiOperation({ summary: 'Create a goods receipt note' })
  @UsePipes(new ZodValidationPipe(grnSchema))
  createGRN(@Body() dto: GrnDto) {
    return this.procurementService.createGRN(dto as any);
  }

  @Post('grns/:id/landed-costs')
  @ApiOperation({ summary: 'Allocate landed costs to a GRN' })
  allocateLandedCost(
    @Param('id') id: string,
    @Body() costs: { type: string; amount: number }[],
  ) {
    return this.procurementService.allocateLandedCost(id, costs);
  }

  @Post('returns')
  @ApiOperation({ summary: 'Create a purchase return' })
  createPurchaseReturn(@Body() dto: any) {
    return this.procurementService.createPurchaseReturn(dto);
  }

  @Get('vendors/:id/scorecard')
  @ApiOperation({ summary: 'Get vendor scorecard' })
  getVendorScorecard(@Param('id') id: string) {
    return this.procurementService.getVendorScorecard(id);
  }

  @Get('purchase-orders/:id/verify-match')
  @ApiOperation({ summary: 'Verify 3-way match for PO' })
  verifyMatch(@Param('id') id: string) {
    return this.procurementService.verifyThreeWayMatch(id);
  }

  @Get('purchase-requests/:id/approval')
  @ApiOperation({ summary: 'Check PR approval status' })
  checkPRApproval(@Param('id') id: string) {
    return this.procurementService.checkPRApproval(id);
  }

  @Post('purchase-orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel a purchase order' })
  cancelPO(
    @Param('id') id: string,
    @Body()
    dto: {
      reason: string;
      lineItemsToCancel?: { poLineId: string; quantity: number }[];
    },
  ) {
    return this.procurementService.cancelPurchaseOrder(
      id,
      dto.reason,
      dto.lineItemsToCancel,
    );
  }

  @Post('grns/:id/inspect')
  @ApiOperation({ summary: 'Inspect a GRN' })
  inspectGRN(
    @Param('id') id: string,
    @Body()
    dto: {
      inspections: {
        grnLineId: string;
        acceptedQuantity: number;
        rejectedQuantity: number;
      }[];
    },
  ) {
    return this.procurementService.inspectGrn(id, dto.inspections);
  }

  @Get('analytics/spend')
  @ApiOperation({ summary: 'Get spend analytics' })
  getSpendAnalytics() {
    return this.procurementService.getSpendAnalytics();
  }

  // ─── Vendor Bills (AP + input VAT) ───────────────────────────────

  @Post('vendor-bills')
  @ApiOperation({ summary: 'Create a vendor bill' })
  @UsePipes(new ZodValidationPipe(createVendorBillSchema))
  createVendorBill(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateVendorBillDto,
  ) {
    return this.procurementService.createVendorBill(tenantId, dto);
  }

  @Get('vendor-bills')
  @ApiOperation({ summary: 'List all vendor bills' })
  listVendorBills(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: VendorBillStatus,
  ) {
    return this.procurementService.findVendorBills(tenantId, status);
  }

  @Get('vendor-bills/:id')
  @ApiOperation({ summary: 'Get vendor bill details' })
  getVendorBill(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.procurementService.getVendorBill(tenantId, id);
  }

  @Post('vendor-bills/:id/submit')
  @ApiOperation({ summary: 'Submit vendor bill for approval' })
  submitVendorBill(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.procurementService.submitVendorBill(tenantId, id);
  }

  @Post('vendor-bills/:id/mark-paid')
  @ApiOperation({ summary: 'Mark vendor bill as paid' })
  markVendorBillPaid(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.procurementService.markVendorBillPaid(tenantId, id);
  }

  @Post('vendor-bills/:id/cancel')
  @ApiOperation({ summary: 'Cancel a vendor bill' })
  cancelVendorBill(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.procurementService.cancelVendorBill(tenantId, id);
  }
}
