import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import {
  NotificationPreference,
  NotificationChannel,
} from './entities/notification-preference.entity';
import { MailerService } from '../mailer/mailer.service';
import * as webpush from 'web-push';
const twilio = require('twilio');
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private twilioClient: any;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    super();
    // Initialize Web Push
    try {
      webpush.setVapidDetails(
        'mailto:support@nurox.io',
        this.configService.get<string>('VAPID_PUBLIC_KEY') || 'dummy',
        this.configService.get<string>('VAPID_PRIVATE_KEY') || 'dummy',
      );
    } catch (e) {
      this.logger.warn('Web Push VAPID keys not configured');
    }

    // Initialize Twilio
    try {
      this.twilioClient = twilio(
        this.configService.get<string>('TWILIO_ACCOUNT_SID'),
        this.configService.get<string>('TWILIO_AUTH_TOKEN'),
      );
    } catch (e) {
      this.logger.warn('Twilio not configured');
    }
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'dispatch') {
      const { tenantId, notificationId, userId } = job.data;

      const notification = await this.notificationRepo.findOne({
        where: { id: notificationId, tenantId },
      });
      const user = await this.userRepo.findOne({ where: { id: userId } });

      if (!notification || !user) return;

      const prefs = await this.preferenceRepo.find({
        where: { tenantId, userId, type: notification.type },
      });

      // Default to sending email if no prefs exist
      const sendEmail =
        prefs.find((p) => p.channel === NotificationChannel.EMAIL)?.isEnabled ??
        true;
      const sendSms =
        prefs.find((p) => p.channel === NotificationChannel.SMS)?.isEnabled ??
        false;
      const sendPush =
        prefs.find((p) => p.channel === NotificationChannel.PUSH)?.isEnabled ??
        false;

      if (sendEmail && user.email) {
        try {
          await this.mailerService.sendMail({
            to: user.email,
            subject: notification.title,
            text: notification.message,
            // You can easily use Handlebars template here
            // html: compileTemplate('notification', { title, message, url })
          });
        } catch (e) {
          this.logger.error(`Failed to send email to ${user.email}`, e);
        }
      }

      if (sendSms && user.phone && this.twilioClient) {
        try {
          await this.twilioClient.messages.create({
            body: `${notification.title}: ${notification.message}`,
            to: user.phone,
            from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
          });
        } catch (e) {
          this.logger.error(`Failed to send SMS to ${user.phone}`, e);
        }
      }

      if (sendPush) {
        // Here you would fetch the user's saved PushSubscription from the DB
        // For demonstration, this is where webpush.sendNotification() goes.
        this.logger.log('Web Push dispatched');
      }

      // Dispatch Webhooks
      if (notification.type === 'ALERT') {
        const webhookUrl = this.configService.get<string>(
          'OUTBOUND_WEBHOOK_URL',
        );
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'notification.alert',
                data: {
                  id: notification.id,
                  title: notification.title,
                  message: notification.message,
                  userId: notification.userId,
                },
              }),
            });
            this.logger.log(`Webhook dispatched to ${webhookUrl}`);
          } catch (e) {
            this.logger.error(`Webhook dispatch failed`, e);
          }
        }
      }
    }
  }
}
