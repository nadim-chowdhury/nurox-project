import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrService } from './hr.service';
import { BiometricService } from './biometric.service';
import { HrProcessor } from './hr-processor.service';
import { HrController } from './hr.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { LeaveModule } from '../leave/leave.module';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { PerformanceReview, KeyResult } from './entities/performance.entity';
import { SalaryHistory } from './entities/salary-history.entity';
import { Training } from './entities/training.entity';
import { Skill } from './entities/skill.entity';
import { EmploymentHistory } from './entities/employment-history.entity';
import { Shift } from './entities/shift.entity';
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
      Shift,
    ]),
    BullModule.registerQueue({
      name: 'hr',
    }),
    AttendanceModule,
    LeaveModule,
    SystemModule,
  ],
  controllers: [HrController],
  providers: [HrService, BiometricService, HrProcessor],
  exports: [HrService, TypeOrmModule],
})
export class HrModule {}
