import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollComputeService } from './payroll-compute.service';
import { PayrollController } from './payroll.controller';
import { PayrollRun, Payslip } from './entities/payroll.entity';
import {
  SalaryStructure,
  SalaryStructureComponent,
  EmployeeSalaryAssignment,
} from './entities/salary-structure.entity';
import { TaxConfiguration, TaxBracket } from './entities/tax-bracket.entity';
import { EmployeeLoan, LoanRepayment } from './entities/loan.entity';
import { AdvanceSalaryRequest } from './entities/advance-salary.entity';
import { EmployeeBonus } from './entities/bonus.entity';
import { PayrollAudit } from './entities/payroll-audit.entity';
import { SalaryHistory } from '../hr/entities/salary-history.entity';
import { AttendanceRecord } from '../attendance/entities/attendance.entity';
import { Employee } from '../hr/entities/employee.entity';
import { BullModule } from '@nestjs/bullmq';
import { PayrollProcessor } from './payroll-processor.service';
import { HrModule } from '../hr/hr.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { LeaveModule } from '../leave/leave.module';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PayrollRun,
      Payslip,
      SalaryStructure,
      SalaryStructureComponent,
      EmployeeSalaryAssignment,
      TaxConfiguration,
      TaxBracket,
      EmployeeLoan,
      LoanRepayment,
      AdvanceSalaryRequest,
      EmployeeBonus,
      PayrollAudit,
      SalaryHistory,
      AttendanceRecord,
      Employee,
    ]),
    HrModule,
    AttendanceModule,
    LeaveModule,
    SystemModule,
    BullModule.registerQueue({
      name: 'payroll',
    }),
  ],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollComputeService, PayrollProcessor],
  exports: [PayrollService, PayrollComputeService],
})
export class PayrollModule {}
