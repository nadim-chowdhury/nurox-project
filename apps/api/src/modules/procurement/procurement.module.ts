import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProcurementService } from './procurement.service';
import { ProcurementController } from './procurement.controller';
import { Vendor } from './entities/vendor.entity';
import {
  PurchaseRequest,
  PurchaseRequestLine,
} from './entities/purchase-request.entity';
import { Rfq, VendorQuote } from './entities/rfq.entity';
import {
  PurchaseOrder,
  PurchaseOrderLine,
} from './entities/purchase-order.entity';
import { Grn, GrnLine } from './entities/grn.entity';
import { DebitNote } from './entities/debit-note.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      PurchaseRequest,
      PurchaseRequestLine,
      Rfq,
      VendorQuote,
      PurchaseOrder,
      PurchaseOrderLine,
      Grn,
      GrnLine,
      DebitNote,
    ]),
    InventoryModule,
    MailerModule,
  ],
  controllers: [ProcurementController],
  providers: [ProcurementService],
  exports: [ProcurementService],
})
export class ProcurementModule {}
