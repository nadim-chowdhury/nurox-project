import { Test, TestingModule } from '@nestjs/testing';
import { BangladeshTaxStrategy } from './bangladesh-tax.strategy';

describe('BangladeshTaxStrategy', () => {
  let strategy: BangladeshTaxStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BangladeshTaxStrategy],
    }).compile();

    strategy = module.get<BangladeshTaxStrategy>(BangladeshTaxStrategy);
  });

  it('should calculate standard 15% VAT', async () => {
    const payload = {
      jurisdiction: 'BD' as any,
      baseAmount: 1000,
      transactionType: 'SALES' as any,
    };

    const result = await strategy.calculateTax('tenant-1', payload);
    expect(result.totalTaxAmount).toBe(150);
    expect(result.breakdown).toContainEqual({
      taxName: 'VAT',
      amount: 150,
      rate: 15,
    });
  });

  it('should calculate SD and VAT correctly (VAT on Base+SD)', async () => {
    const payload = {
      jurisdiction: 'BD' as any,
      baseAmount: 1000,
      transactionType: 'SALES' as any,
      sdRate: 10, // 10% SD
      vatRate: 15, // 15% VAT
    };

    // SD = 1000 * 0.10 = 100
    // VAT = (1000 + 100) * 0.15 = 1100 * 0.15 = 165
    // Total Tax = 100 + 165 = 265

    const result = await strategy.calculateTax('tenant-1', payload);
    expect(result.totalTaxAmount).toBe(265);
    expect(result.breakdown).toContainEqual({
      taxName: 'SD',
      amount: 100,
      rate: 10,
    });
    expect(result.breakdown).toContainEqual({
      taxName: 'VAT',
      amount: 165,
      rate: 15,
    });
  });

  it('should apply AIT for large sales transactions', async () => {
    const payload = {
      jurisdiction: 'BD' as any,
      baseAmount: 100000,
      transactionType: 'SALES' as any,
    };

    const result = await strategy.calculateTax('tenant-1', payload);
    // VAT = 100000 * 0.15 = 15000
    // AIT = 100000 * 0.05 = 5000
    // Total = 20000
    expect(result.totalTaxAmount).toBe(20000);
    expect(result.breakdown).toContainEqual({
      taxName: 'AIT',
      amount: 5000,
      rate: 5,
    });
  });
});
