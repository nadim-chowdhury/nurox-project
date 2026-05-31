import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxRule } from './entities/tax-rule.entity';
import { TaxFilingExport } from './entities/tax-filing.entity';
import { Mushak63 } from './entities/mushak-63.entity';
import { Mushak63Item } from './entities/mushak-63-item.entity';
import { VdsCertificate } from './entities/vds-certificate.entity';
import { TaxEngineService } from './services/tax-engine.service';
import { MushakService } from './services/mushak.service';
import { ComplianceReportService } from './services/compliance-report.service';
import { ComplianceController } from './controllers/compliance.controller';
import { BangladeshTaxStrategy } from './strategies/bangladesh-tax.strategy';
import { IndiaTaxStrategy } from './strategies/india-tax.strategy';
import { UsaTaxStrategy } from './strategies/usa-tax.strategy';
import { ProcurementModule } from '../procurement/procurement.module';
import { SystemModule } from '../system/system.module';
import { TaxFilingService } from './services/tax-filing.service';
import { Vendor } from '../procurement/entities/vendor.entity';
import { Tenant } from '../system/entities/tenant.entity';

@Module({
  imports: [
    ProcurementModule,
    SystemModule,
    TypeOrmModule.forFeature([
      TaxRule,
      TaxFilingExport,
      Mushak63,
      Mushak63Item,
      VdsCertificate,
      Vendor,
      Tenant,
    ]),
  ],
  controllers: [ComplianceController],
  providers: [
    TaxEngineService,
    MushakService,
    ComplianceReportService,
    BangladeshTaxStrategy,
    IndiaTaxStrategy,
    UsaTaxStrategy,
    TaxFilingService,
  ],
  exports: [
    TaxEngineService,
    MushakService,
    ComplianceReportService,
    TaxFilingService,
  ],
})
export class ComplianceModule {}
