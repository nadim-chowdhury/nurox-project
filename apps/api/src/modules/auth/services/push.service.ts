import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);

  // Mock DB store for subscriptions
  private subscriptions: Record<string, any[]> = {};

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const publicKey =
      this.configService.get('VAPID_PUBLIC_KEY') || 'mock-public-key';
    const privateKey =
      this.configService.get('VAPID_PRIVATE_KEY') || 'mock-private-key';
    const email = 'mailto:support@nurox.local';

    if (publicKey === 'mock-public-key') {
      this.logger.warn(
        'VAPID keys not set. Web push notifications will run in STUB mode.',
      );
    } else {
      webpush.setVapidDetails(email, publicKey, privateKey);
    }
  }

  async subscribe(userId: string, subscription: any) {
    if (!this.subscriptions[userId]) {
      this.subscriptions[userId] = [];
    }
    this.subscriptions[userId].push(subscription);
    this.logger.log(`User ${userId} subscribed to push notifications`);
    return { success: true };
  }

  async sendPushNotification(userId: string, payload: any) {
    const userSubs = this.subscriptions[userId];
    if (!userSubs || userSubs.length === 0) {
      this.logger.log(`No push subscriptions found for user ${userId}`);
      return;
    }

    const promises = userSubs.map((sub) =>
      webpush.sendNotification(sub, JSON.stringify(payload)).catch((err) => {
        this.logger.error('Failed to send push notification', err);
      }),
    );
    await Promise.all(promises);
  }
}
