import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Lead } from './entities/lead.entity';
import { Deal } from './entities/deal.entity';
import { Account } from './entities/account.entity';
import { Contact } from './entities/contact.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { Quotation, QuotationLine } from './entities/quotation.entity';
import { SalesOrder, SalesOrderLine } from './entities/sales-order.entity';
import {
  DeliveryOrder,
  DeliveryOrderLine,
} from './entities/delivery-order.entity';
import { Pricelist, PricelistItem } from './entities/pricelist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lead,
      Deal,
      Account,
      Contact,
      ActivityLog,
      Quotation,
      QuotationLine,
      SalesOrder,
      SalesOrderLine,
      DeliveryOrder,
      DeliveryOrderLine,
      Pricelist,
      PricelistItem,
    ]),
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
