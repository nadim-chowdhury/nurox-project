import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobRequisition } from './entities/job-requisition.entity';
import { Candidate } from './entities/candidate.entity';
import { Application } from './entities/application.entity';
import { Interview } from './entities/interview.entity';
import { OfferLetter } from './entities/offer-letter.entity';
import { OnboardingChecklist } from './entities/onboarding-checklist.entity';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentController } from './recruitment.controller';
import { PublicRecruitmentController } from './public-recruitment.controller';
import { SystemModule } from '../system/system.module';
import { UsersModule } from '../users/users.module';
import { BullModule } from '@nestjs/bullmq';
import { RecruitmentProcessor } from './recruitment.processor';
import { MailerModule } from '../mailer/mailer.module';
import { DatabaseModule } from '../../database/database.module';
import { LeaveModule } from '../leave/leave.module';
import { PayrollModule } from '../payroll/payroll.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JobRequisition,
      Candidate,
      Application,
      Interview,
      OfferLetter,
      OnboardingChecklist,
    ]),
    BullModule.registerQueue({
      name: 'recruitment',
    }),
    SystemModule,
    UsersModule,
    MailerModule,
    DatabaseModule,
    LeaveModule,
    PayrollModule,
  ],
  controllers: [RecruitmentController, PublicRecruitmentController],
  providers: [RecruitmentService, RecruitmentProcessor],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
