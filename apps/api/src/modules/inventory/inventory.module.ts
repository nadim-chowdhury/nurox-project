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
import { UomGroup } from './entities/uom-group.entity';
import { UomConversion } from './entities/uom-conversion.entity';
import { Bom } from './entities/bom.entity';
import { BomItem } from './entities/bom-item.entity';
import { GoodsReceipt } from './entities/goods-receipt.entity';
import { GoodsReceiptItem } from './entities/goods-receipt-item.entity';
import { GoodsIssue } from './entities/goods-issue.entity';
import { GoodsIssueItem } from './entities/goods-issue-item.entity';
import { GoodsReturn } from './entities/goods-return.entity';
import { GoodsReturnItem } from './entities/goods-return-item.entity';
import { StockTransfer } from './entities/stock-transfer.entity';
import { StockTransferItem } from './entities/stock-transfer-item.entity';
import { SerialNumber } from './entities/serial-number.entity';
import { Inventory } from './entities/inventory.entity';

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
      UomGroup,
      UomConversion,
      Bom,
      BomItem,
      GoodsReceipt,
      GoodsReceiptItem,
      GoodsIssue,
      GoodsIssueItem,
      GoodsReturn,
      GoodsReturnItem,
      StockTransfer,
      StockTransferItem,
      SerialNumber,
      Inventory,
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
