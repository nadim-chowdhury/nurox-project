import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrService } from './hr.service';
import { AttendanceService } from './attendance.service';
import { BiometricService } from './biometric.service';
import { HrProcessor } from './hr-processor.service';
import { HrController } from './hr.controller';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { PerformanceReview, KeyResult } from './entities/performance.entity';
import { SalaryHistory } from './entities/salary-history.entity';
import { Training } from './entities/training.entity';
import { Skill } from './entities/skill.entity';
import { EmploymentHistory } from './entities/employment-history.entity';
import { AttendanceRecord } from './entities/attendance.entity';
import { LeaveRequest, LeaveBalance } from './entities/leave.entity';
import { Shift } from './entities/shift.entity';
import { Holiday } from './entities/holiday.entity';
import { BullModule } from '@nestjs/bullmq';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Department,
      Designation,
      PerformanceReview,
      KeyResult,
      SalaryHistory,
      Training,
      Skill,
      EmploymentHistory,
      AttendanceRecord,
      LeaveRequest,
      LeaveBalance,
      Shift,
      Holiday,
    ]),
    BullModule.registerQueue({
      name: 'hr',
    }),
    SystemModule,
  ],
  controllers: [HrController],
  providers: [HrService, AttendanceService, BiometricService, HrProcessor],
  exports: [HrService, AttendanceService, TypeOrmModule],
})
export class HrModule {}
