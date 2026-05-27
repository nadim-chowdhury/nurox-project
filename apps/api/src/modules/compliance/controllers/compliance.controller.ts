import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { TaxEngineService } from '../services/tax-engine.service';
import {
  CalculateTaxPayloadDto,
  calculateTaxPayloadSchema,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('compliance/tax')
export class ComplianceController {
  constructor(private readonly taxEngine: TaxEngineService) {}

  @Post('calculate')
  @UsePipes(new ZodValidationPipe(calculateTaxPayloadSchema))
  async calculateTax(
    @CurrentTenant() tenantId: string,
    @Body() payload: CalculateTaxPayloadDto,
  ) {
    return this.taxEngine.calculateTax(tenantId, payload);
  }

  @Post('export/:jurisdiction')
  async exportTaxFiling(
    @CurrentTenant() tenantId: string,
    @Param('jurisdiction') jurisdiction: string,
    @Body('period') period: string,
  ) {
    return this.taxEngine.exportTaxFiling(tenantId, jurisdiction, period);
  }
}
