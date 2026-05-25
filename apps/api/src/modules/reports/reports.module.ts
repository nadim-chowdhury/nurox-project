import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportTemplate } from './entities/report-template.entity';
import { ReportSchedule } from './entities/report-schedule.entity';
import { PinnedReport } from './entities/pinned-report.entity';
import { ReportSchedulerProcessor } from './processors/report-scheduler.processor';
import { SystemModule } from '../system/system.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportTemplate, ReportSchedule, PinnedReport]),
    SystemModule,
    BullModule.registerQueue({
      name: 'report-scheduler',
    }),
  ],
  providers: [ReportsService, ReportSchedulerProcessor],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
