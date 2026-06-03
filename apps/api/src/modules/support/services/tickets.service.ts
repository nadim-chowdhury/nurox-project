import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';
import { TicketMessage } from '../entities/ticket-message.entity';
import { CreateTicketDto } from '@repo/shared-schemas';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(TicketMessage)
    private readonly messageRepo: Repository<TicketMessage>,
    @InjectQueue('support')
    private readonly supportQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTicket(
    tenantId: string,
    requesterId: string,
    dto: CreateTicketDto,
  ) {
    // 1. Auto-assignment logic (simple mock)
    // If category is 'IT Support', assign to a predefined user or leave null for manual assign
    const assigneeId: string | undefined = undefined;
    if (dto.category === 'IT Support') {
      // assigneeId = 'some-it-admin-uuid';
    }

    const ticket = this.ticketRepo.create({
      tenantId,
      requesterId,
      assigneeId,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      category: dto.category,
      status: 'OPEN',
    });

    await this.ticketRepo.save(ticket);
    this.logger.log(`Ticket ${ticket.id} created by user ${requesterId}`);

    this.eventEmitter.emit('ticket.created', { tenantId, ticketId: ticket.id });

    // Queue SLA Response Timer (e.g., 2 hours for P3)
    await this.supportQueue.add(
      'sla_breach_alert',
      { ticketId: ticket.id, type: 'response' },
      { delay: 2 * 60 * 60 * 1000 },
    );

    return ticket;
  }

  async getTickets(
    tenantId: string,
    options: { status?: string; requesterId?: string; assigneeId?: string },
  ) {
    const query: any = { tenantId };
    if (options.status) query.status = options.status;
    if (options.requesterId) query.requesterId = options.requesterId;
    if (options.assigneeId) query.assigneeId = options.assigneeId;

    return this.ticketRepo.find({
      where: query,
      order: { createdAt: 'DESC' },
      relations: ['requester', 'assignee'],
    });
  }

  async getTicket(tenantId: string, ticketId: string) {
    const ticket = await this.ticketRepo.findOne({
      where: { id: ticketId, tenantId },
      relations: ['requester', 'assignee', 'messages', 'messages.sender'],
    });

    if (!ticket) {
      throw new HttpException('Ticket not found', HttpStatus.NOT_FOUND);
    }
    return ticket;
  }

  async addMessage(
    tenantId: string,
    ticketId: string,
    senderId: string,
    content: string,
    isInternal: boolean = false,
  ) {
    const ticket = await this.getTicket(tenantId, ticketId);

    const message = this.messageRepo.create({
      ticketId,
      senderId,
      content,
      isInternal,
    });

    await this.messageRepo.save(message);

    this.eventEmitter.emit('ticket.message_added', {
      tenantId,
      ticketId,
      senderId,
      isInternal,
    });

    // Automatically transition OPEN tickets to IN_PROGRESS or PENDING_USER based on who replied
    if (ticket.status === 'OPEN') {
      ticket.status = isInternal
        ? 'OPEN'
        : senderId === ticket.requesterId
          ? 'OPEN'
          : 'PENDING_USER';
      await this.ticketRepo.save(ticket);
    }

    return message;
  }

  async resolveTicket(tenantId: string, ticketId: string, userId: string) {
    const ticket = await this.getTicket(tenantId, ticketId);
    ticket.status = 'RESOLVED';
    ticket.resolvedAt = new Date();
    await this.ticketRepo.save(ticket);

    // Trigger CSAT survey
    if (ticket.requester) {
      await this.supportQueue.add('csat_survey', {
        ticketId: ticket.id,
        requesterEmail: ticket.requester.email,
      });
    }

    return ticket;
  }
}
