import { CalculateTaxPayloadDto } from '@repo/shared-schemas';

export interface TaxCalculationResult {
  totalTaxAmount: number;
  breakdown: Array<{
    taxName: string;
    amount: number;
    rate: number;
  }>;
}

export interface ITaxCalculator {
  calculateTax(
    tenantId: string,
    payload: CalculateTaxPayloadDto,
  ): Promise<TaxCalculationResult>;
}
