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
import { SystemModule } from '../system/system.module';
import { UsersModule } from '../users/users.module';
import { BullModule } from '@nestjs/bullmq';

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
  ],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
