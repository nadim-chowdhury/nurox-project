import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailerService } from '../../mailer/mailer.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from '../entities/ticket.entity';

@Processor('support')
export class SlaProcessor extends WorkerHost {
  private readonly logger = new Logger(SlaProcessor.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing SLA job ${job.id} of type ${job.name}`);

    try {
      switch (job.name) {
        case 'sla_breach_alert': {
          const { ticketId, type } = job.data; // type = 'response' | 'resolution'
          const ticket = await this.ticketRepo.findOne({
            where: { id: ticketId },
            relations: ['assignee'],
          });

          if (!ticket) return;

          if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
            this.logger.warn(`SLA Breach (${type}) for ticket ${ticket.id}`);
            // In a real scenario, we'd send an email to the assignee or manager
            if (ticket.assignee) {
              await this.mailerService.sendMail({
                to: ticket.assignee.email,
                subject: `SLA Breach Alert: Ticket #${ticket.id}`,
                html: `<p>Ticket <b>${ticket.title}</b> has breached its ${type} SLA.</p>`,
              });
            }
          }
          break;
        }
        case 'ticket_escalation': {
          const { ticketId } = job.data;
          this.logger.warn(`Escalating ticket ${ticketId}`);
          // Update ticket priority or notify manager
          break;
        }
        case 'csat_survey': {
          const { ticketId, requesterEmail } = job.data;
          this.logger.log(
            `Sending CSAT survey for resolved ticket ${ticketId}`,
          );
          await this.mailerService.sendMail({
            to: requesterEmail,
            subject: 'How did we do?',
            html: '<p>Please rate your support experience from 1 to 5 stars.</p>',
          });
          break;
        }
        default:
          this.logger.warn(`Unknown support job type: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to process support job ${job.id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
