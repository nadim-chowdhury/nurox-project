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
import { OKRCheckIn } from './entities/okr-checkin.entity';
import { SalaryHistory } from './entities/salary-history.entity';
import { Training } from './entities/training.entity';
import { TrainingCourse } from './entities/training-course.entity';
import { Skill } from './entities/skill.entity';
import { SkillCatalog } from './entities/skill-catalog.entity';
import { ReviewFeedback } from './entities/review-feedback.entity';
import { PIPActionPlan } from './entities/pip-action-plan.entity';
import { ENPSSurvey, ENPSResponse } from './entities/enps.entity';
import { Handbook, HandbookAcknowledgment } from './entities/handbook.entity';
import { SuccessionPlan } from './entities/succession-plan.entity';
import { EmploymentHistory } from './entities/employment-history.entity';
import { SalaryRevision } from './entities/salary-revision.entity';
import { ProbationRecord } from './entities/probation-record.entity';
import { TransferRequest } from './entities/transfer-request.entity';
import { ProfileChangeRequest } from './entities/profile-change-request.entity';
import { Resignation } from './entities/resignation.entity';
import { Termination } from './entities/termination.entity';
import { ExitInterview } from './entities/exit-interview.entity';
import { ClearanceChecklist } from './entities/clearance-checklist.entity';
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
      OKRCheckIn,
      SalaryHistory,
      Training,
      TrainingCourse,
      Skill,
      SkillCatalog,
      ReviewFeedback,
      PIPActionPlan,
      ENPSSurvey,
      ENPSResponse,
      Handbook,
      HandbookAcknowledgment,
      SuccessionPlan,
      EmploymentHistory,
      SalaryRevision,
      ProbationRecord,
      TransferRequest,
      ProfileChangeRequest,
      Resignation,
      Termination,
      ExitInterview,
      ClearanceChecklist,
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
