import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { BangladeshTaxStrategy } from '../strategies/bangladesh-tax.strategy';
import { IndiaTaxStrategy } from '../strategies/india-tax.strategy';
import { UsaTaxStrategy } from '../strategies/usa-tax.strategy';
import { ITaxCalculator } from '../interfaces/tax-calculator.interface';
import { CalculateTaxPayloadDto } from '@repo/shared-schemas';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxFilingExport } from '../entities/tax-filing.entity';

@Injectable()
export class TaxEngineService {
  private readonly logger = new Logger(TaxEngineService.name);

  constructor(
    private readonly bdTaxStrategy: BangladeshTaxStrategy,
    private readonly inTaxStrategy: IndiaTaxStrategy,
    private readonly usTaxStrategy: UsaTaxStrategy,
    @InjectRepository(TaxFilingExport)
    private readonly exportRepo: Repository<TaxFilingExport>,
  ) {}

  private getStrategy(jurisdiction: string): ITaxCalculator {
    switch (jurisdiction) {
      case 'BD':
        return this.bdTaxStrategy;
      case 'IN':
        return this.inTaxStrategy;
      case 'US':
        return this.usTaxStrategy;
      default:
        throw new BadRequestException(
          `Tax calculator for jurisdiction ${jurisdiction} is not supported.`,
        );
    }
  }

  async calculateTax(tenantId: string, payload: CalculateTaxPayloadDto) {
    const strategy = this.getStrategy(payload.jurisdiction);
    this.logger.log(
      `Calculating tax for jurisdiction ${payload.jurisdiction} amount ${payload.baseAmount}`,
    );
    return strategy.calculateTax(tenantId, payload);
  }

  async exportTaxFiling(
    tenantId: string,
    jurisdiction: string,
    period: string,
  ) {
    // Stub for fetching aggregated taxes and generating GSTR-1, BD NBR XML, etc.
    const mockPayload = {
      period,
      jurisdiction,
      totalTaxCollected: 50000,
      totalTaxPaid: 12000,
      netPayable: 38000,
      transactions: [],
    };

    const record = this.exportRepo.create({
      tenantId,
      jurisdiction,
      period,
      payload: mockPayload,
      format: 'JSON',
    });

    return this.exportRepo.save(record);
  }
}
