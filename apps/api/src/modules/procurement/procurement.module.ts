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
import { ApprovalMatrix } from './entities/approval-matrix.entity';
import { VendorEvaluation } from './entities/vendor-evaluation.entity';
import { VendorBill } from './entities/vendor-bill.entity';
import { VendorBillLine } from './entities/vendor-bill-line.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { MailerModule } from '../mailer/mailer.module';
import { FinanceModule } from '../finance/finance.module';
import { SmartProcurementService } from './services/smart-procurement.service';
import { User } from '../users/entities/user.entity';
import { Product } from '../inventory/entities/product.entity';
import { ProductVariant } from '../inventory/entities/product-variant.entity';

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
      ApprovalMatrix,
      VendorEvaluation,
      VendorBill,
      VendorBillLine,
      User,
      Product,
      ProductVariant,
    ]),
    InventoryModule,
    MailerModule,
    FinanceModule,
  ],
  controllers: [ProcurementController],
  providers: [ProcurementService, SmartProcurementService],
  exports: [ProcurementService, SmartProcurementService],
})
export class ProcurementModule {}
