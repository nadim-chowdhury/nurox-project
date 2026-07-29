import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TicketsService } from '../services/tickets.service';
import { SupportAiService } from '../services/support-ai.service';
import { CreateTicketDto, createTicketSchema } from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('support/tickets')
export class TicketsController {
  constructor(
    private readonly ticketsService: TicketsService,
    private readonly supportAiService: SupportAiService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTicketSchema))
  async createTicket(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketsService.createTicket(tenantId, user.id, dto);
  }

  @Get()
  async getTickets(
    @CurrentTenant() tenantId: string,
    @Query('status') status?: string,
    @Query('requesterId') requesterId?: string,
  ) {
    return this.ticketsService.getTickets(tenantId, { status, requesterId });
  }

  @Get(':id')
  async getTicket(
    @CurrentTenant() tenantId: string,
    @Param('id') ticketId: string,
  ) {
    return this.ticketsService.getTicket(tenantId, ticketId);
  }

  @Post(':id/messages')
  async addMessage(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') ticketId: string,
    @Body() body: { content: string; isInternal?: boolean },
  ) {
    return this.ticketsService.addMessage(
      tenantId,
      ticketId,
      user.id,
      body.content,
      body.isInternal,
    );
  }

  @Post(':id/resolve')
  async resolveTicket(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') ticketId: string,
  ) {
    return this.ticketsService.resolveTicket(tenantId, ticketId, user.id);
  }

  @Post(':id/analyze')
  async analyzeTicket(
    @CurrentTenant() tenantId: string,
    @Param('id') ticketId: string,
  ) {
    return this.supportAiService.analyzeTicket(tenantId, ticketId);
  }

  @Get(':id/suggested-reply')
  async getSuggestedReply(
    @CurrentTenant() tenantId: string,
    @Param('id') ticketId: string,
  ) {
    const reply = await this.supportAiService.getSuggestedReply(
      tenantId,
      ticketId,
    );
    return { reply };
  }

  @Post(':id/route')
  async routeTicket(
    @CurrentTenant() tenantId: string,
    @Param('id') ticketId: string,
  ) {
    return this.supportAiService.routeTicket(tenantId, ticketId);
  }
}
