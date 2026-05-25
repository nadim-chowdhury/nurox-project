import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationsGateway } from './notifications.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export class CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepo: Repository<NotificationPreference>,
    private readonly gateway: NotificationsGateway,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
  ) {}

  async send(tenantId: string, dto: CreateNotificationDto) {
    // 1. Create DB Record
    const notification = this.notificationRepo.create({
      tenantId,
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      actionUrl: dto.actionUrl,
    });

    await this.notificationRepo.save(notification);

    // 2. Broadcast via WebSocket (In-App)
    this.gateway.server
      .to(`tenant:${tenantId}:user:${dto.userId}`)
      .emit('notification', notification);

    // 3. Queue for external channels (Email/SMS/Push) based on preferences
    await this.notificationsQueue.add('dispatch', {
      tenantId,
      notificationId: notification.id,
      userId: dto.userId,
    });

    return notification;
  }

  async broadcastToTenant(
    tenantId: string,
    payload: { title: string; message: string; type: NotificationType },
  ) {
    this.gateway.server.to(`tenant:${tenantId}`).emit('announcement', payload);
  }

  async getUserNotifications(tenantId: string, userId: string, limit = 50) {
    return this.notificationRepo.find({
      where: { tenantId, userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async markAsRead(tenantId: string, userId: string, notificationId: string) {
    await this.notificationRepo.update(
      { tenantId, userId, id: notificationId },
      { isRead: true },
    );
    return { success: true };
  }

  async markAllAsRead(tenantId: string, userId: string) {
    await this.notificationRepo.update(
      { tenantId, userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }

  async deleteNotification(
    tenantId: string,
    userId: string,
    notificationId: string,
  ) {
    await this.notificationRepo.delete({
      tenantId,
      userId,
      id: notificationId,
    });
    return { success: true };
  }
}
