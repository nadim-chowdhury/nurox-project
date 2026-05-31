import { Test, TestingModule } from '@nestjs/testing';
import { PayrollComputeService } from './payroll-compute.service';
import {
  SalaryStructure,
  PayrollComponentType,
  AmountType,
} from './entities/salary-structure.entity';
import { TaxConfiguration } from './entities/tax-bracket.entity';

describe('PayrollComputeService', () => {
  let service: PayrollComputeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PayrollComputeService],
    }).compile();

    service = module.get<PayrollComputeService>(PayrollComputeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculatePayslipItems', () => {
    const mockStructure: Partial<SalaryStructure> = {
      components: [
        {
          name: 'House Rent',
          type: PayrollComponentType.EARNING,
          amountType: AmountType.PERCENTAGE,
          value: 40,
          isTaxable: true,
          dependsOn: 'Basic',
        } as any,
        {
          name: 'Medical',
          type: PayrollComponentType.EARNING,
          amountType: AmountType.FIXED,
          value: 2000,
          isTaxable: false,
          dependsOn: null,
        } as any,
        {
          name: 'PF',
          type: PayrollComponentType.STATUTORY,
          amountType: AmountType.PERCENTAGE,
          value: 10,
          isTaxable: false,
          dependsOn: 'Basic',
        } as any,
      ],
    };

    const mockTaxConfig: Partial<TaxConfiguration> = {
      taxExemptThreshold: 350000,
      brackets: [
        { upperLimit: 450000, rate: 5 } as any, // 350k + 100k
        { upperLimit: 750000, rate: 10 } as any, // 450k + 300k
        { upperLimit: null, rate: 15 } as any,
      ],
    };

    it('should calculate gross, net and LOP correctly', () => {
      const baseSalary = 50000;
      const unpaidLeaveDays = 2; // 2 days LOP

      const result = service.calculatePayslipItems(
        baseSalary,
        mockStructure as SalaryStructure,
        null, // No tax for this test
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        unpaidLeaveDays,
      );

      // Basic: 50000
      // HRA (40%): 20000
      // Medical (Fixed): 2000
      // Total Gross (before LOP): 72000
      // LOP (2 days): (50000 / 30) * 2 = 3333.33
      // Gross after LOP: 72000 - 3333.33 = 68666.67

      // PF (10% of Basic): 5000
      // Net Pay: 68666.67 - 5000 = 63666.67

      expect(result.grossPay).toBeCloseTo(68666.67, 2);
      expect(result.netPay).toBeCloseTo(63666.67, 2);
      expect(result.items).toContainEqual(
        expect.objectContaining({
          name: 'Loss of Pay (LOP)',
          amount: expect.any(Number),
        }),
      );
    });

    it('should calculate annual tax projection correctly', () => {
      const baseSalary = 60000;
      // Taxable: 60000 + 24000 (HRA 40%) = 84000
      // Annual Taxable: 84000 * 12 = 1,008,000
      // Exempt: 350,000
      // Taxable after exempt: 658,000
      // Bracket 1 (5% on 100,000): 5,000
      // Bracket 2 (10% on 300,000): 30,000
      // Bracket 3 (15% on remainder 258,000): 38,700
      // Total Annual Tax: 5000 + 30000 + 38700 = 73,700
      // Monthly Tax: 73,700 / 12 = 6,141.67

      const result = service.calculatePayslipItems(
        baseSalary,
        mockStructure as SalaryStructure,
        mockTaxConfig as TaxConfiguration,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
      );

      expect(
        result.items.find((i) => i.name === 'Income Tax')?.amount,
      ).toBeCloseTo(6141.67, 2);
    });
  });
});
