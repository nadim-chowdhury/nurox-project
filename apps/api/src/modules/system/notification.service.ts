import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPriority } from './entities/notification.entity';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(data: {
    tenantId: string;
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
    actionUrl?: string;
  }) {
    const notification = this.notificationRepo.create(data);
    const saved = await this.notificationRepo.save(notification);

    // Broadcast in real-time
    this.notificationsGateway.sendToUser(data.userId, 'newNotification', saved);

    return saved;
  }

  async findAll(userId: string, tenantId: string, query: { page?: number; limit?: number; unreadOnly?: boolean }) {
    const { page = 1, limit = 20, unreadOnly = false } = query;
    const qb = this.notificationRepo.createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .andWhere('n.tenantId = :tenantId', { tenantId });

    if (unreadOnly) {
      qb.andWhere('n.isRead = :isRead', { isRead: false });
    }

    const [data, total] = await qb
      .orderBy('n.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        unreadCount: await this.countUnread(userId, tenantId),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');

    notification.isRead = true;
    notification.readAt = new Date();
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string, tenantId: string) {
    return this.notificationRepo.update(
      { userId, tenantId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async countUnread(userId: string, tenantId: string): Promise<number> {
    return this.notificationRepo.count({ where: { userId, tenantId, isRead: false } });
  }

  async delete(id: string, userId: string) {
    const notification = await this.notificationRepo.findOne({ where: { id, userId } });
    if (!notification) throw new NotFoundException('Notification not found');
    return this.notificationRepo.remove(notification);
  }
}
