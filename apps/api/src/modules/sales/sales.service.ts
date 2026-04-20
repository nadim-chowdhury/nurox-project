import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { Deal } from './entities/deal.entity';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal) private readonly dealRepo: Repository<Deal>,
  ) {}

  // ─── LEADS ──────────────────────────────────────────────────

  async createLead(dto: Partial<Lead>): Promise<Lead> {
    const lead = this.leadRepo.create(dto);
    const saved = await this.leadRepo.save(lead);
    this.logger.log(`Lead created: ${saved.name}`);
    return saved;
  }

  async findAllLeads(page = 1, limit = 20, search?: string, status?: string) {
    const qb = this.leadRepo.createQueryBuilder('l');
    if (search)
      qb.andWhere(
        '(l.name ILIKE :s OR l.company ILIKE :s OR l.email ILIKE :s)',
        { s: `%${search}%` },
      );
    if (status) qb.andWhere('l.status = :status', { status });
    qb.orderBy('l.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findLeadById(id: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id } });
    if (!lead) throw new NotFoundException(`Lead "${id}" not found`);
    return lead;
  }

  async updateLead(id: string, dto: Partial<Lead>): Promise<Lead> {
    await this.findLeadById(id);
    await this.leadRepo.update(id, dto);
    return this.findLeadById(id);
  }

  async removeLead(id: string): Promise<void> {
    await this.findLeadById(id);
    await this.leadRepo.softDelete(id);
  }

  // ─── DEALS ──────────────────────────────────────────────────

  async createDeal(dto: Partial<Deal>): Promise<Deal> {
    const deal = this.dealRepo.create(dto);
    const saved = await this.dealRepo.save(deal);
    this.logger.log(`Deal created: ${saved.title} — $${saved.value}`);
    return saved;
  }

  async findAllDeals(page = 1, limit = 20, status?: string) {
    const qb = this.dealRepo.createQueryBuilder('d');
    if (status) qb.andWhere('d.status = :status', { status });
    qb.orderBy('d.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findDealById(id: string): Promise<Deal> {
    const deal = await this.dealRepo.findOne({ where: { id } });
    if (!deal) throw new NotFoundException(`Deal "${id}" not found`);
    return deal;
  }

  async updateDeal(id: string, dto: Partial<Deal>): Promise<Deal> {
    await this.findDealById(id);
    await this.dealRepo.update(id, dto);
    return this.findDealById(id);
  }

  async removeDeal(id: string): Promise<void> {
    await this.findDealById(id);
    await this.dealRepo.softDelete(id);
  }
}
