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
import { Product } from '../inventory/entities/product.entity';
import { FinanceModule } from '../finance/finance.module';
import { ComplianceModule } from '../compliance/compliance.module';
import { SalesOrderFlowService } from './sales-order-flow.service';

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
      Product,
    ]),
    FinanceModule,
    ComplianceModule,
  ],
  controllers: [SalesController],
  providers: [SalesService, SalesOrderFlowService],
  exports: [SalesService, SalesOrderFlowService],
})
export class SalesModule {}
