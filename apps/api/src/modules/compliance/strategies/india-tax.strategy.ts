import { Injectable } from '@nestjs/common';
import {
  ITaxCalculator,
  TaxCalculationResult,
} from '../interfaces/tax-calculator.interface';
import { CalculateTaxPayloadDto } from '@repo/shared-schemas';

@Injectable()
export class IndiaTaxStrategy implements ITaxCalculator {
  async calculateTax(
    tenantId: string,
    payload: CalculateTaxPayloadDto,
  ): Promise<TaxCalculationResult> {
    // India GST MVP Logic
    const baseGstRate = 0.18; // standard 18% slab for MVP
    const isInterstate = payload.originState !== payload.destinationState;

    const totalGstAmount = payload.baseAmount * baseGstRate;
    const breakdown: Array<{ taxName: string; amount: number; rate: number }> =
      [];

    if (isInterstate) {
      // IGST applies
      breakdown.push({
        taxName: 'IGST',
        amount: totalGstAmount,
        rate: baseGstRate * 100,
      });
    } else {
      // CGST and SGST split equally
      const halfTax = totalGstAmount / 2;
      const halfRate = (baseGstRate * 100) / 2;
      breakdown.push({ taxName: 'CGST', amount: halfTax, rate: halfRate });
      breakdown.push({ taxName: 'SGST', amount: halfTax, rate: halfRate });
    }

    return {
      totalTaxAmount: totalGstAmount,
      breakdown,
    };
  }
}
