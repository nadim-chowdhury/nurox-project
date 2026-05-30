import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bom } from './entities/bom.entity';
import { BomItem } from './entities/bom-item.entity';
import { Workcenter } from './entities/workcenter.entity';
import { Machine } from './entities/machine.entity';
import { WorkOrder } from './entities/work-order.entity';
import { WorkOrderStage } from './entities/work-order-stage.entity';
import { ProductionLog } from './entities/production-log.entity';
import { ManufacturingService } from './services/manufacturing.service';
import { ManufacturingController } from './controllers/manufacturing.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bom,
      BomItem,
      Workcenter,
      Machine,
      WorkOrder,
      WorkOrderStage,
      ProductionLog,
    ]),
    InventoryModule,
  ],
  controllers: [ManufacturingController],
  providers: [ManufacturingService],
  exports: [ManufacturingService],
})
export class ManufacturingModule {}
