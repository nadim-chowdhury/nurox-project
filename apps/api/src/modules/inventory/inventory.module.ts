import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { Product } from './entities/product.entity';
import { Warehouse } from './entities/warehouse.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { Zone } from './entities/zone.entity';
import { Rack } from './entities/rack.entity';
import { Bin } from './entities/bin.entity';
import { Batch } from './entities/batch.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockCount } from './entities/stock-count.entity';
import { StockCountItem } from './entities/stock-count-item.entity';
import { InventoryProcessor } from './inventory.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductVariant,
      Warehouse,
      Zone,
      Rack,
      Bin,
      Batch,
      StockMovement,
      StockCount,
      StockCountItem,
    ]),
    BullModule.registerQueue({
      name: 'inventory_alerts',
    }),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryProcessor],
  exports: [InventoryService],
})
export class InventoryModule {}
