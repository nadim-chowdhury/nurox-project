import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { Deal } from './entities/deal.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
  ) {}

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
}
