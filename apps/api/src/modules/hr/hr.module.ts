import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrService } from './hr.service';
import { HrProcessor } from './hr-processor.service';
import { HrController } from './hr.controller';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { PerformanceReview, KeyResult } from './entities/performance.entity';
import { SalaryHistory } from './salary-history.entity';
import { Training } from './entities/training.entity';
import { Skill } from './entities/skill.entity';
import { EmploymentHistory } from './entities/employment-history.entity';
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
    ]),
    BullModule.registerQueue({
      name: 'hr',
    }),
    SystemModule,
  ],
  controllers: [HrController],
  providers: [HrService, HrProcessor],
  exports: [HrService],
})
export class HrModule {}
