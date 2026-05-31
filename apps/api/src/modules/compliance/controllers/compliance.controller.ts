import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TaxEngineService } from '../services/tax-engine.service';
import {
  CalculateTaxPayloadDto,
  calculateTaxPayloadSchema,
  Mushak63Dto,
  mushak63Schema,
  VdsCertificateDto,
  vdsCertificateSchema,
  GenerateVatReturnDto,
  generateVatReturnSchema,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { MushakService } from '../services/mushak.service';
import { ComplianceReportService } from '../services/compliance-report.service';
import { TaxFilingService } from '../services/tax-filing.service';
import { Response } from 'express';
import { Res } from '@nestjs/common';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('compliance/tax')
export class ComplianceController {
  constructor(
    private readonly taxEngine: TaxEngineService,
    private readonly mushakService: MushakService,
    private readonly reportService: ComplianceReportService,
    private readonly filingService: TaxFilingService,
  ) {}

  @Post('calculate')
  @UsePipes(new ZodValidationPipe(calculateTaxPayloadSchema))
  async calculateTax(
    @CurrentTenant() tenantId: string,
    @Body() payload: CalculateTaxPayloadDto,
  ) {
    return this.taxEngine.calculateTax(tenantId, payload);
  }

  @Get('readiness/:period')
  async checkReadiness(
    @CurrentTenant() tenantId: string,
    @Param('period') period: string,
  ) {
    return this.filingService.checkReadiness(tenantId, period);
  }

  @Get('filing-package/:period')
  async downloadFilingPackage(
    @CurrentTenant() tenantId: string,
    @Param('period') period: string,
    @Res() res: Response,
  ) {
    return this.filingService.generateFilingPackage(tenantId, period, res);
  }

  @Post('export/:jurisdiction')
  async exportTaxFiling(
    @CurrentTenant() tenantId: string,
    @Param('jurisdiction') jurisdiction: string,
    @Body('period') period: string,
  ) {
    return this.taxEngine.exportTaxFiling(tenantId, jurisdiction, period);
  }

  @Post('mushak-63')
  @UsePipes(new ZodValidationPipe(mushak63Schema))
  async createMushak63(
    @CurrentTenant() tenantId: string,
    @Body() dto: Mushak63Dto,
  ) {
    return this.mushakService.createMushak63(tenantId, dto);
  }

  @Get('mushak-63')
  async listMushak63(@CurrentTenant() tenantId: string) {
    return this.mushakService.listMushak63(tenantId);
  }

  @Get('mushak-63/:id')
  async getMushak63(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.mushakService.getMushak63(tenantId, id);
  }

  @Post('vds-certificate')
  @UsePipes(new ZodValidationPipe(vdsCertificateSchema))
  async createVdsCertificate(
    @CurrentTenant() tenantId: string,
    @Body() dto: VdsCertificateDto,
  ) {
    return this.mushakService.createVdsCertificate(tenantId, dto);
  }

  @Get('vds-certificates')
  async listVdsCertificates(@CurrentTenant() tenantId: string) {
    return this.mushakService.listVdsCertificates(tenantId);
  }

  @Post('mushak-9-1')
  @UsePipes(new ZodValidationPipe(generateVatReturnSchema))
  async generateMushak91(
    @CurrentTenant() tenantId: string,
    @Body() dto: GenerateVatReturnDto,
  ) {
    return this.reportService.generateMushak91(tenantId, dto.period);
  }

  @Get('mushak-63/:id/pdf')
  async downloadMushak63Pdf(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportService.generateMushak63Pdf(tenantId, id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=mushak-6.3-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('vds-certificate/:id/pdf')
  async downloadVdsCertificatePdf(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportService.generateVdsCertificatePdf(
      tenantId,
      id,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=vds-certificate-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
