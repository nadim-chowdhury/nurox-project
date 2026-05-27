import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('support/analytics')
export class SupportAnalyticsController {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) {}

  @Get()
  async getAnalytics(@CurrentTenant() tenantId: string) {
    const totalTickets = await this.ticketRepo.count({ where: { tenantId } });
    const openTickets = await this.ticketRepo.count({
      where: { tenantId, status: 'OPEN' },
    });
    const resolvedTickets = await this.ticketRepo.count({
      where: { tenantId, status: 'RESOLVED' },
    });

    // Mock CSAT and Resolution times (normally computed via aggregation queries)
    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResolutionTimeHours: 4.5,
      slaComplianceRate: 94.2,
      csatScore: 4.8,
    };
  }
}
