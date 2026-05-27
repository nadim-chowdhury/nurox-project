import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxRule } from './entities/tax-rule.entity';
import { TaxFilingExport } from './entities/tax-filing.entity';
import { TaxEngineService } from './services/tax-engine.service';
import { ComplianceController } from './controllers/compliance.controller';
import { BangladeshTaxStrategy } from './strategies/bangladesh-tax.strategy';
import { IndiaTaxStrategy } from './strategies/india-tax.strategy';
import { UsaTaxStrategy } from './strategies/usa-tax.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([TaxRule, TaxFilingExport])],
  controllers: [ComplianceController],
  providers: [
    TaxEngineService,
    BangladeshTaxStrategy,
    IndiaTaxStrategy,
    UsaTaxStrategy,
  ],
  exports: [TaxEngineService],
})
export class ComplianceModule {}
