import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ForecastingService } from './services/forecasting.service';
import { DemandForecast } from './entities/demand-forecast.entity';
import { HrModule } from '../hr/hr.module';
import { FinanceModule } from '../finance/finance.module';
import { SalesModule } from '../sales/sales.module';
import { ProjectsModule } from '../projects/projects.module';
import { InventoryModule } from '../inventory/inventory.module';
import { ProcurementModule } from '../procurement/procurement.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { AiModule } from '../ai/ai.module';
import { AnalyticsGateway } from './analytics.gateway';
import { Product } from '../inventory/entities/product.entity';
import { StockMovement } from '../inventory/entities/stock-movement.entity';
import { Warehouse } from '../inventory/entities/warehouse.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SmartAlertService } from './services/smart-alert.service';
import { InventoryOptimizationService } from './services/inventory-optimization.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DemandForecast,
      Product,
      StockMovement,
      User,
      Warehouse,
      Inventory,
    ]),
    HrModule,
    FinanceModule,
    SalesModule,
    ProjectsModule,
    InventoryModule,
    ProcurementModule,
    AttendanceModule,
    AiModule,
    NotificationsModule,
  ],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsGateway,
    ForecastingService,
    SmartAlertService,
    InventoryOptimizationService,
  ],
  exports: [
    AnalyticsService,
    ForecastingService,
    SmartAlertService,
    InventoryOptimizationService,
  ],
})
export class AnalyticsModule {}
