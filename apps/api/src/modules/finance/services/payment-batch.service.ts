import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, IsNull } from 'typeorm';
import {
  PaymentBatch,
  PaymentBatchStatus,
  PaymentBatchItem,
} from '../entities/payment-batch.entity';
import { Bill, BillStatus } from '../entities/bill.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { Vendor } from '../../procurement/entities/vendor.entity';
import { ClsService } from 'nestjs-cls';
import { SequenceService } from '../../system/sequence.service';

@Injectable()
export class PaymentBatchService {
  private readonly logger = new Logger(PaymentBatchService.name);

  constructor(
    @InjectRepository(PaymentBatch)
    private readonly batchRepo: Repository<PaymentBatch>,
    @InjectRepository(Bill)
    private readonly billRepo: Repository<Bill>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    private readonly dataSource: DataSource,
    private readonly cls: ClsService,
    private readonly sequenceService: SequenceService,
  ) {}

  private get tenantId(): string {
    return this.cls.get('tenantId');
  }

  async createBatch(dto: {
    bankAccountId: string;
    billIds: string[];
    paymentDate?: Date;
    notes?: string;
  }): Promise<PaymentBatch> {
    const account = await this.bankAccountRepo.findOne({
      where: { id: dto.bankAccountId, tenantId: this.tenantId },
    });
    if (!account) throw new NotFoundException('Bank account not found');

    const bills = await this.billRepo.find({
      where: {
        id: In(dto.billIds),
        tenantId: this.tenantId,
        status: BillStatus.APPROVED, // Only approved bills can be paid
      },
    });

    if (bills.length === 0) {
      throw new BadRequestException(
        'No approved bills found for the provided IDs',
      );
    }

    const batchNumber = await this.sequenceService.getNextNumber(
      this.tenantId,
      'PAYMENT_BATCH',
      'PAY-',
    );

    return await this.dataSource.transaction(async (manager) => {
      const batch = manager.create(PaymentBatch, {
        tenantId: this.tenantId,
        batchNumber,
        bankAccountId: dto.bankAccountId,
        paymentDate: dto.paymentDate || new Date(),
        currency: account.currency,
        status: PaymentBatchStatus.DRAFT,
        notes: dto.notes,
        totalAmount: 0,
      });

      const items: PaymentBatchItem[] = [];
      let total = 0;

      for (const bill of bills) {
        const vendor = await this.vendorRepo.findOne({
          where: { id: bill.vendorId ?? IsNull(), tenantId: this.tenantId },
        });
        const amountToPay = Number(bill.totalAmount) - Number(bill.paidAmount);

        if (amountToPay <= 0) continue;

        items.push(
          manager.create(PaymentBatchItem, {
            tenantId: this.tenantId,
            billId: bill.id,
            amountToPay,
            vendorBankName: vendor?.bankDetails?.bankName || null,
            vendorAccountNumber: vendor?.bankDetails?.accountNumber || null,
            vendorRoutingNumber: vendor?.bankDetails?.routingNumber || null,
          }),
        );

        total += amountToPay;
      }

      batch.items = items;
      batch.totalAmount = total;

      return manager.save(batch);
    });
  }

  async generateBankInstructionFile(
    batchId: string,
  ): Promise<{ filename: string; content: string }> {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId, tenantId: this.tenantId },
      relations: ['items', 'items.bill', 'bankAccount'],
    });

    if (!batch) throw new NotFoundException('Payment batch not found');

    // Generate CSV (BEFTN format example)
    let csv =
      'Receiver Name,Receiver Account,Receiver Bank,Routing Number,Amount,Reference\n';

    for (const item of batch.items) {
      csv += `"${item.bill.vendorName}","${item.vendorAccountNumber || ''}","${item.vendorBankName || ''}","${item.vendorRoutingNumber || ''}",${item.amountToPay},"${item.bill.billNumber}"\n`;
    }

    batch.status = PaymentBatchStatus.SENT_TO_BANK;
    await this.batchRepo.save(batch);

    return {
      filename: `Bank_Instructions_${batch.batchNumber}.csv`,
      content: csv,
    };
  }

  async finalizeBatch(batchId: string): Promise<PaymentBatch> {
    const batch = await this.batchRepo.findOne({
      where: { id: batchId, tenantId: this.tenantId },
      relations: ['items', 'items.bill'],
    });

    if (!batch) throw new NotFoundException('Payment batch not found');
    if (batch.status === PaymentBatchStatus.COMPLETED) {
      throw new BadRequestException('Batch is already completed');
    }

    return await this.dataSource.transaction(async (manager) => {
      for (const item of batch.items) {
        const bill = item.bill;
        bill.paidAmount = Number(bill.paidAmount) + Number(item.amountToPay);

        if (Number(bill.paidAmount) >= Number(bill.totalAmount)) {
          bill.status = BillStatus.PAID;
        } else {
          bill.status = BillStatus.PARTIALLY_PAID;
        }

        await manager.save(bill);

        // TODO: Auto-generate Journal Entry for the payment
      }

      batch.status = PaymentBatchStatus.COMPLETED;
      return manager.save(batch);
    });
  }

  async findAll() {
    return this.batchRepo.find({
      where: { tenantId: this.tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const batch = await this.batchRepo.findOne({
      where: { id, tenantId: this.tenantId },
      relations: ['items', 'items.bill', 'bankAccount'],
    });
    if (!batch) throw new NotFoundException('Payment batch not found');
    return batch;
  }
}
