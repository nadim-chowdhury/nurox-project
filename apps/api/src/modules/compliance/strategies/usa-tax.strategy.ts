import { Injectable } from '@nestjs/common';
import {
  ITaxCalculator,
  TaxCalculationResult,
} from '../interfaces/tax-calculator.interface';
import { CalculateTaxPayloadDto } from '@repo/shared-schemas';

@Injectable()
export class UsaTaxStrategy implements ITaxCalculator {
  async calculateTax(
    tenantId: string,
    payload: CalculateTaxPayloadDto,
  ): Promise<TaxCalculationResult> {
    // US Tax MVP Logic
    const breakdown: Array<{ taxName: string; amount: number; rate: number }> =
      [];
    let totalTaxAmount = 0;

    if (payload.transactionType === 'SALES') {
      // Standard state sales tax stub
      const stateSalesRate = 0.07; // 7% mock state tax
      const salesTax = payload.baseAmount * stateSalesRate;
      breakdown.push({
        taxName: 'State Sales Tax',
        amount: salesTax,
        rate: stateSalesRate * 100,
      });
      totalTaxAmount += salesTax;
    } else if (payload.transactionType === 'PAYROLL') {
      // Mock payroll taxes
      const federalIncomeTaxRate = 0.22;
      const ficaSocialSecurityRate = 0.062;
      const ficaMedicareRate = 0.0145;

      const fedAmount = payload.baseAmount * federalIncomeTaxRate;
      const ssAmount = payload.baseAmount * ficaSocialSecurityRate;
      const medAmount = payload.baseAmount * ficaMedicareRate;

      breakdown.push({
        taxName: 'Federal Income Tax',
        amount: fedAmount,
        rate: federalIncomeTaxRate * 100,
      });
      breakdown.push({
        taxName: 'FICA - Social Security',
        amount: ssAmount,
        rate: ficaSocialSecurityRate * 100,
      });
      breakdown.push({
        taxName: 'FICA - Medicare',
        amount: medAmount,
        rate: ficaMedicareRate * 100,
      });

      totalTaxAmount += fedAmount + ssAmount + medAmount;
    }

    return {
      totalTaxAmount,
      breakdown,
    };
  }
}
