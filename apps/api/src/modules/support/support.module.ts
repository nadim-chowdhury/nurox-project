import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketMessage } from './entities/ticket-message.entity';
import { KbArticle } from './entities/kb-article.entity';
import { TicketSla } from './entities/ticket-sla.entity';
import { TicketsService } from './services/tickets.service';
import { TicketsController } from './controllers/tickets.controller';
import { KnowledgeBaseService } from './services/knowledge-base.service';
import { KnowledgeBaseController } from './controllers/knowledge-base.controller';
import { SupportAnalyticsController } from './controllers/support-analytics.controller';
import { SlaProcessor } from './processors/sla.processor';
import { ImapService } from './services/imap.service';
import { BullModule } from '@nestjs/bullmq';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketMessage, KbArticle, TicketSla]),
    BullModule.registerQueue({ name: 'support' }),
    MailerModule,
  ],
  controllers: [
    TicketsController,
    KnowledgeBaseController,
    SupportAnalyticsController,
  ],
  providers: [TicketsService, SlaProcessor, ImapService, KnowledgeBaseService],
  exports: [TicketsService, KnowledgeBaseService],
})
export class SupportModule {}
