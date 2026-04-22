import { Injectable, Logger } from '@nestjs/common';
import {
  SalaryStructure,
  PayrollComponentType,
  AmountType,
} from './entities/salary-structure.entity';
import { TaxConfiguration } from './entities/tax-bracket.entity';

@Injectable()
export class PayrollComputeService {
  private readonly logger = new Logger(PayrollComputeService.name);

  /**
   * Calculates the payslip items for an employee based on their salary structure.
   */
  calculatePayslipItems(
    baseSalary: number,
    structure: SalaryStructure,
    taxConfig: TaxConfiguration | null,
    overtimeHours: number = 0,
    overtimeRate: number = 0,
    bonuses: number = 0,
    leaveEncashmentDays: number = 0,
    arrears: number = 0,
  ) {
    const items: Array<{
      name: string;
      amount: number;
      type: 'EARNING' | 'DEDUCTION' | 'STATUTORY';
    }> = [];

    // Map to keep track of resolved component values for dependencies
    const resolvedValues = new Map<string, number>();
    resolvedValues.set('Basic', baseSalary);

    // 1. Base Earning
    items.push({ name: 'Basic Salary', amount: baseSalary, type: 'EARNING' });
    let grossPay = baseSalary;
    let taxableAmount = baseSalary;

    // Leave Encashment Calculation
    if (leaveEncashmentDays > 0) {
        const perDaySalary = baseSalary / 30; // Standard 30 days divisor
        const encashmentAmount = leaveEncashmentDays * perDaySalary;
        items.push({ name: 'Leave Encashment', amount: encashmentAmount, type: 'EARNING' });
        grossPay += encashmentAmount;
        taxableAmount += encashmentAmount;
    }

    // Arrears Calculation
    if (arrears > 0) {
        items.push({ name: 'Salary Arrears', amount: arrears, type: 'EARNING' });
        grossPay += arrears;
        taxableAmount += arrears;
    }

    // 2. Add Earnings from Structure (handling dependsOn)
    for (const comp of structure.components.filter(
      (c) => c.type === PayrollComponentType.EARNING,
    )) {
      let amount = 0;
      const baseForComp = comp.dependsOn ? (resolvedValues.get(comp.dependsOn) || baseSalary) : baseSalary;

      if (comp.amountType === AmountType.FIXED) {
        amount = Number(comp.value);
      } else {
        // Percentage of Dependee or Base
        amount = (baseForComp * Number(comp.value)) / 100;
      }

      items.push({ name: comp.name, amount, type: 'EARNING' });
      resolvedValues.set(comp.name, amount);
      grossPay += amount;
      if (comp.isTaxable) taxableAmount += amount;
    }

    // 3. Add Overtime & Bonuses
    if (overtimeHours > 0) {
      const otAmount = overtimeHours * overtimeRate;
      items.push({ name: 'Overtime', amount: otAmount, type: 'EARNING' });
      grossPay += otAmount;
      taxableAmount += otAmount;
    }

    if (bonuses > 0) {
      items.push({ name: 'Bonus/Incentive', amount: bonuses, type: 'EARNING' });
      grossPay += bonuses;
      taxableAmount += bonuses;
    }

    // 4. Calculate Deductions (Non-statutory)
    let totalDeductions = 0;
    for (const comp of structure.components.filter(
      (c) => c.type === PayrollComponentType.DEDUCTION,
    )) {
      let amount = 0;
      const baseForComp = comp.dependsOn ? (resolvedValues.get(comp.dependsOn) || baseSalary) : baseSalary;

      if (comp.amountType === AmountType.FIXED) {
        amount = Number(comp.value);
      } else {
        amount = (baseForComp * Number(comp.value)) / 100;
      }
      items.push({ name: comp.name, amount, type: 'DEDUCTION' });
      totalDeductions += amount;
    }

    // 5. Calculate Statutory (PF, Tax)
    let employerPfContribution = 0;

    // Provident Fund (Typically 10% of Basic)
    const pfComponent = structure.components.find(
      (c) => c.name.includes('Provident Fund') || c.name.includes('PF'),
    );
    if (pfComponent) {
      const pfAmount =
        pfComponent.amountType === AmountType.FIXED
          ? Number(pfComponent.value)
          : (baseSalary * Number(pfComponent.value)) / 100;

      items.push({
        name: 'Employee PF Contribution',
        amount: pfAmount,
        type: 'STATUTORY',
      });
      totalDeductions += pfAmount;

      // Employer PF (Usually matched or slightly different)
      employerPfContribution = pfAmount; 
    }

    // Income Tax Calculation (Monthly projection)
    if (taxConfig) {
      const annualTaxable = taxableAmount * 12;
      const annualTax = this.calculateAnnualTax(annualTaxable, taxConfig);
      const monthlyTax = annualTax / 12;

      if (monthlyTax > 0) {
        items.push({
          name: 'Income Tax',
          amount: monthlyTax,
          type: 'STATUTORY',
        });
        totalDeductions += monthlyTax;
      }
    }

    const netPay = grossPay - totalDeductions;

    return {
      items,
      grossPay,
      totalDeductions,
      netPay,
      employerPfContribution,
    };
  }

  /**
   * BD TIN Compliant Tax Calculation logic.
   */
  private calculateAnnualTax(
    taxableIncome: number,
    config: TaxConfiguration,
  ): number {
    if (taxableIncome <= config.taxExemptThreshold) return 0;

    let remainingIncome = taxableIncome - config.taxExemptThreshold;
    let totalTax = 0;

    const sortedBrackets = [...config.brackets].sort((a, b) => {
      if (a.upperLimit === null) return 1;
      if (b.upperLimit === null) return -1;
      return a.upperLimit - b.upperLimit;
    });

    let previousLimit = config.taxExemptThreshold;

    for (const bracket of sortedBrackets) {
      const bracketRange =
        bracket.upperLimit === null
          ? remainingIncome
          : Math.min(remainingIncome, bracket.upperLimit - previousLimit);

      if (bracketRange <= 0) break;

      totalTax += (bracketRange * Number(bracket.rate)) / 100;
      remainingIncome -= bracketRange;
      previousLimit = bracket.upperLimit!;

      if (remainingIncome <= 0) break;
    }

    return totalTax;
  }
}
