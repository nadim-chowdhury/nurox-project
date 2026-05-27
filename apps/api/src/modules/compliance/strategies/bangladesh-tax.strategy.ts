import { Injectable } from '@nestjs/common';
import {
  ITaxCalculator,
  TaxCalculationResult,
} from '../interfaces/tax-calculator.interface';
import { CalculateTaxPayloadDto } from '@repo/shared-schemas';

@Injectable()
export class BangladeshTaxStrategy implements ITaxCalculator {
  async calculateTax(
    tenantId: string,
    payload: CalculateTaxPayloadDto,
  ): Promise<TaxCalculationResult> {
    // Bangladesh NBR MVP Logic
    const vatRate = 0.15; // 15% standard VAT
    let aitRate = 0;

    // AIT deduction example logic for certain transactions
    if (payload.transactionType === 'SALES' && payload.baseAmount > 50000) {
      aitRate = 0.05; // 5% AIT for large invoices
    }

    const vatAmount = payload.baseAmount * vatRate;
    const aitAmount = payload.baseAmount * aitRate;

    const breakdown = [
      { taxName: 'VAT', amount: vatAmount, rate: vatRate * 100 },
    ];

    if (aitRate > 0) {
      breakdown.push({
        taxName: 'AIT',
        amount: aitAmount,
        rate: aitRate * 100,
      });
    }

    return {
      totalTaxAmount: vatAmount + aitAmount,
      breakdown,
    };
  }
}
