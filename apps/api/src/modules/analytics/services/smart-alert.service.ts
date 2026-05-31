import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ForecastingService } from './forecasting.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SmartAlertService {
  private readonly logger = new Logger(SmartAlertService.name);

  constructor(
    private readonly forecastingService: ForecastingService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('inventory.low_stock')
  async handleLowStock(payload: {
    tenantId: string;
    productId: string;
    sku: string;
    name: string;
    currentStock: number;
    reorderPoint: number;
  }) {
    this.logger.log(
      `Handling low stock alert for ${payload.sku} in tenant ${payload.tenantId}`,
    );

    // 1. Get Forecast
    const forecasts = await this.forecastingService.getLatestForecasts(
      payload.productId,
      payload.tenantId,
    );

    // Calculate total predicted demand for the next 30 days
    const next30Days = new Date();
    next30Days.setDate(next30Days.getDate() + 30);

    const predictedDemand = forecasts
      .filter((f) => f.forecastDate <= next30Days)
      .reduce((sum, f) => sum + Number(f.predictedQuantity), 0);

    const stockRunoutDays =
      predictedDemand > 0 ? (payload.currentStock / predictedDemand) * 30 : 999;

    let urgency = 'MEDIUM';
    if (stockRunoutDays < 7) urgency = 'HIGH';
    if (stockRunoutDays < 2) urgency = 'CRITICAL';

    // 2. Find relevant users to notify (ADMIN or INVENTORY_MANAGER)
    const users = await this.userRepo.find({
      where: [
        { tenantId: payload.tenantId, role: 'ADMIN' },
        { tenantId: payload.tenantId, role: 'INVENTORY_MANAGER' },
      ],
    });

    for (const user of users) {
      await this.notificationsService.send(payload.tenantId, {
        userId: user.id,
        type:
          urgency === 'CRITICAL'
            ? NotificationType.ALERT
            : NotificationType.WARNING,
        title: `Low Stock Alert: ${payload.name} (${payload.sku})`,
        message: `Current stock: ${payload.currentStock}. Predicted 30-day demand: ${predictedDemand.toFixed(0)}. Estimated run-out in ${stockRunoutDays.toFixed(1)} days. Urgency: ${urgency}.`,
        actionUrl: `/inventory/products/${payload.productId}`,
      });
    }

    // 3. Emit event for procurement suggestion
    this.eventEmitter.emit('procurement.suggestion.needed', {
      ...payload,
      predictedDemand,
      urgency,
    });
  }
}
