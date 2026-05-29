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
    const vatRate =
      payload.vatRate !== undefined ? payload.vatRate / 100 : 0.15; // default 15%
    const sdRate = payload.sdRate !== undefined ? payload.sdRate / 100 : 0;

    let aitRate = 0;

    // AIT deduction example logic for certain transactions
    if (payload.transactionType === 'SALES' && payload.baseAmount > 50000) {
      aitRate = 0.05; // 5% AIT for large invoices
    }

    // SD is calculated on Base Amount
    const sdAmount = payload.baseAmount * sdRate;

    // VAT is calculated on (Base Amount + SD Amount)
    const vatAmount = (payload.baseAmount + sdAmount) * vatRate;

    const aitAmount = payload.baseAmount * aitRate;

    const breakdown = [];

    if (sdAmount > 0) {
      breakdown.push({
        taxName: 'SD',
        amount: sdAmount,
        rate: sdRate * 100,
      });
    }

    breakdown.push({
      taxName: 'VAT',
      amount: vatAmount,
      rate: vatRate * 100,
    });

    if (aitRate > 0) {
      breakdown.push({
        taxName: 'AIT',
        amount: aitAmount,
        rate: aitRate * 100,
      });
    }

    return {
      totalTaxAmount: vatAmount + sdAmount + aitAmount,
      breakdown,
    };
  }
}
