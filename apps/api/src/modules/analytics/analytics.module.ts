import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { HrModule } from '../hr/hr.module';
import { FinanceModule } from '../finance/finance.module';
import { SalesModule } from '../sales/sales.module';
import { ProjectsModule } from '../projects/projects.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { AnalyticsGateway } from './analytics.gateway';

@Module({
  imports: [
    HrModule,
    FinanceModule,
    SalesModule,
    ProjectsModule,
    InventoryModule,
    ProcurementModule,
    AttendanceModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsGateway],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
