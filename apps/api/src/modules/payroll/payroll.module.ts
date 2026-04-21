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
import { HrModule } from '../hr/hr.module';
import { SystemModule } from '../system/system.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
    ]),
    HrModule,
    SystemModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [PayrollController],
  providers: [PayrollService, PayrollComputeService],
  exports: [PayrollService, PayrollComputeService],
})
export class PayrollModule {}
