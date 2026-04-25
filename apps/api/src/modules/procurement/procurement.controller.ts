import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckModule } from '../../common/guards/module.guard';
import {
  VendorDto,
  PurchaseRequestDto,
  RfqDto,
  PurchaseOrderDto,
  GrnDto,
  VendorQuoteDto,
} from '@repo/shared-schemas';

@ApiTags('Procurement')
@Controller('procurement')
@UseGuards(JwtAuthGuard)
@CheckModule('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Post('vendors')
  createVendor(@Body() dto: VendorDto) {
    return this.procurementService.createVendor(dto as any);
  }

  @Get('vendors')
  findAllVendors() {
    return this.procurementService.findAllVendors();
  }

  @Post('purchase-requests')
  createPR(@Body() dto: PurchaseRequestDto) {
    return this.procurementService.createPR(dto as any);
  }

  @Post('rfqs')
  createRFQ(@Body() dto: RfqDto) {
    return this.procurementService.createRFQ(dto as any);
  }

  @Get('rfqs/:id/comparison')
  getRfqComparison(@Param('id') id: string) {
    return this.procurementService.getRfqComparison(id);
  }

  @Post('quotes')
  submitQuote(@Body() dto: VendorQuoteDto) {
    return this.procurementService.submitQuote(dto as any);
  }

  @Post('purchase-orders')
  createPO(@Body() dto: PurchaseOrderDto) {
    return this.procurementService.createPO(dto as any);
  }

  @Post('purchase-orders/:id/send')
  sendPO(@Param('id') id: string) {
    return this.procurementService.sendPOByEmail(id);
  }

  @Patch('purchase-orders/:id/amend')
  amendPO(@Param('id') id: string, @Body() dto: any) {
    return this.procurementService.amendPO(id, dto);
  }

  @Post('grns')
  createGRN(@Body() dto: GrnDto) {
    return this.procurementService.createGRN(dto as any);
  }

  @Post('grns/:id/landed-costs')
  allocateLandedCost(
    @Param('id') id: string,
    @Body() costs: { type: string; amount: number }[],
  ) {
    return this.procurementService.allocateLandedCost(id, costs);
  }

  @Post('returns')
  createPurchaseReturn(@Body() dto: any) {
    return this.procurementService.createPurchaseReturn(dto);
  }

  @Get('vendors/:id/scorecard')
  getVendorScorecard(@Param('id') id: string) {
    return this.procurementService.getVendorScorecard(id);
  }

  @Get('purchase-orders/:id/verify-match')
  verifyMatch(@Param('id') id: string) {
    return this.procurementService.verifyThreeWayMatch(id);
  }
}
