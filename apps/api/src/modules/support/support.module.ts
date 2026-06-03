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
import { SupportAiService } from './services/support-ai.service';
import { BullModule } from '@nestjs/bullmq';
import { MailerModule } from '../mailer/mailer.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketMessage, KbArticle, TicketSla]),
    BullModule.registerQueue({ name: 'support' }),
    MailerModule,
    AiModule,
  ],
  controllers: [
    TicketsController,
    KnowledgeBaseController,
    SupportAnalyticsController,
  ],
  providers: [
    TicketsService,
    SlaProcessor,
    ImapService,
    KnowledgeBaseService,
    SupportAiService,
  ],
  exports: [TicketsService, KnowledgeBaseService, SupportAiService],
})
export class SupportModule {}
