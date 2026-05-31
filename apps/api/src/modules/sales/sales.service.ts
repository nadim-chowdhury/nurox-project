import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { Deal } from './entities/deal.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

import { Account } from './entities/account.entity';
import { Contact } from './entities/contact.entity';
import { ActivityLog } from './entities/activity-log.entity';
import {
  Quotation,
  QuotationStatus,
  QuotationLine,
} from './entities/quotation.entity';
import {
  SalesOrder,
  SOStatus,
  SalesOrderLine,
} from './entities/sales-order.entity';
import {
  DeliveryOrder,
  DOStatus,
  DeliveryOrderLine,
} from './entities/delivery-order.entity';
import { Pricelist } from './entities/pricelist.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
    @InjectRepository(ActivityLog)
    private readonly activityRepo: Repository<ActivityLog>,
    @InjectRepository(Quotation)
    private readonly quotationRepo: Repository<Quotation>,
    @InjectRepository(SalesOrder)
    private readonly soRepo: Repository<SalesOrder>,
    @InjectRepository(DeliveryOrder)
    private readonly doRepo: Repository<DeliveryOrder>,
    @InjectRepository(Pricelist)
    private readonly pricelistRepo: Repository<Pricelist>,
  ) {}

  async getPipelineValue(): Promise<number> {
    const result = await this.dealRepo
      .createQueryBuilder('deal')
      .select('SUM(deal.value)', 'total')
      .where('deal.status = :status', { status: 'OPEN' })
      .getRawOne<{ total: string }>();

    return Number(result?.total) || 0;
  }

  async getPipelineStats() {
    return this.dealRepo
      .createQueryBuilder('deal')
      .select('deal.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(deal.value)', 'value')
      .where('deal.status = :status', { status: 'OPEN' })
      .groupBy('deal.stage')
      .getRawMany<{ stage: string; count: string; value: string }>();
  }

  async createLead(dto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepo.create(dto);
    return this.leadRepo.save(lead);
  }

  async findAllLeads(): Promise<Lead[]> {
    return this.leadRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findLeadById(id: string): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead with ID ${id} not found`);
    return lead;
  }

  async updateLead(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findLeadById(id);
    Object.assign(lead, dto);
    return this.leadRepo.save(lead);
  }

  async removeLead(id: string): Promise<void> {
    const result = await this.leadRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }
  }

  async createDeal(dto: CreateDealDto): Promise<Deal> {
    const deal = this.dealRepo.create(dto);
    return this.dealRepo.save(deal);
  }

  async findAllDeals(): Promise<Deal[]> {
    return this.dealRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findDealById(id: string): Promise<Deal> {
    const deal = await this.dealRepo.findOneBy({ id });
    if (!deal) throw new NotFoundException(`Deal with ID ${id} not found`);
    return deal;
  }

  async updateDeal(id: string, dto: UpdateDealDto): Promise<Deal> {
    const deal = await this.findDealById(id);
    Object.assign(deal, dto);
    return this.dealRepo.save(deal);
  }

  async removeDeal(id: string): Promise<void> {
    const result = await this.dealRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Deal with ID ${id} not found`);
    }
  }

  // --- LEAD SCORING & ROUTING ---
  async calculateLeadScore(leadId: string): Promise<number> {
    const lead = await this.findLeadById(leadId);
    let score = 0;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.estimatedValue && lead.estimatedValue > 10000) score += 20;
    if (lead.source === 'Referral') score += 15;

    lead.score = score;
    await this.leadRepo.save(lead);
    return score;
  }

  async assignLeadRoundRobin(leadId: string, userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;
    const lead = await this.findLeadById(leadId);
    // Simple mock logic for round-robin
    const assignedUserId = userIds[Math.floor(Math.random() * userIds.length)];
    lead.assignedTo = assignedUserId;
    await this.leadRepo.save(lead);
  }

  // --- QUOTATIONS ---
  async createQuotation(dto: any): Promise<Quotation> {
    const quotation = this.quotationRepo.create({
      ...dto,
      quotationNumber: `QT-${Date.now()}`,
    } as unknown as Quotation);
    return this.quotationRepo.save(quotation);
  }

  async resendQuotation(quotationId: string): Promise<Quotation> {
    const qt = await this.quotationRepo.findOne({
      where: { id: quotationId },
      relations: ['lines'],
    });
    if (!qt) throw new NotFoundException('Quotation not found');

    // Create new version
    const newQt = this.quotationRepo.create({
      ...qt,
      id: undefined,
      quotationNumber: `${qt.quotationNumber.split('-v')[0]}-v${qt.version + 1}`,
      version: qt.version + 1,
    });

    // Mark old as expired
    qt.status = QuotationStatus.EXPIRED;
    await this.quotationRepo.save(qt);

    return this.quotationRepo.save(newQt);
  }

  // --- SALES ORDERS ---
  async convertQuotationToSO(quotationId: string): Promise<SalesOrder> {
    const qt = await this.quotationRepo.findOne({
      where: { id: quotationId },
      relations: ['lines'],
    });
    if (!qt) throw new NotFoundException('Quotation not found');

    const soLines = qt.lines.map((l) =>
      this.soRepo.manager.create(SalesOrderLine, {
        productId: l.productId,
        variantId: l.variantId,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        discountPercent: l.discountPercent,
        taxPercent: l.taxPercent,
      }),
    );

    const so = this.soRepo.create({
      quotationId: qt.id,
      accountId: qt.accountId || '00000000-0000-0000-0000-000000000000',
      soNumber: `SO-${Date.now()}`,
      orderDate: new Date(),
      currency: qt.currency,
      lines: soLines,
    });

    qt.status = QuotationStatus.ACCEPTED;
    await this.quotationRepo.save(qt);

    return this.soRepo.save(so);
  }

  async checkCreditLimit(
    accountId: string,
    soAmount: number,
  ): Promise<boolean> {
    // Mock logic: block if account exceeds a certain hardcoded limit
    const MAX_LIMIT = 50000;
    // In reality, this would sum up AR balance from Finance module
    const currentBalance = 0;
    if (currentBalance + soAmount > MAX_LIMIT) {
      throw new Error('Credit limit exceeded');
    }
    return true;
  }

  // --- ANALYTICS ---
  async getSalesFunnelAnalytics() {
    const leadsByStatus = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('lead.status')
      .getRawMany();

    const dealsByStage = await this.dealRepo
      .createQueryBuilder('deal')
      .select('deal.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .groupBy('deal.stage')
      .getRawMany();

    return { leadsByStatus, dealsByStage };
  }
}
