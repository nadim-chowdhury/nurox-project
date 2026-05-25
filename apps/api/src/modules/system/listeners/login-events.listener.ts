import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginEvent } from '../entities/login-event.entity';
import * as geoip from 'geoip-lite';
import { RedisService } from '../../redis/redis.service';

export interface UserLoginEventPayload {
  userId: string;
  tenantId: string;
  ipAddress: string;
  userAgent: string;
  deviceFingerprint?: string;
}

@Injectable()
export class LoginEventsListener {
  private readonly logger = new Logger(LoginEventsListener.name);

  constructor(
    @InjectRepository(LoginEvent)
    private readonly loginEventRepo: Repository<LoginEvent>,
    private readonly redisService: RedisService,
  ) {}

  @OnEvent('user.login')
  async handleUserLoginEvent(payload: UserLoginEventPayload) {
    try {
      const geo = geoip.lookup(payload.ipAddress || '');
      const country = geo?.country || 'Unknown';
      const city = geo?.city || 'Unknown';

      // Check for anomalies (e.g. login from new country)
      const previousLogin = await this.loginEventRepo.findOne({
        where: { userId: payload.userId, tenantId: payload.tenantId },
        order: { createdAt: 'DESC' },
      });

      if (
        previousLogin &&
        previousLogin.country !== 'Unknown' &&
        previousLogin.country !== country
      ) {
        this.logger.warn(
          `Anomaly Detected: User ${payload.userId} logged in from a new country: ${country} (Previously ${previousLogin.country})`,
        );
        // Here we could emit a notification event to alert the user via email
      }

      // Check for unusual hour (e.g., 12 AM - 5 AM)
      const currentHour = new Date().getHours();
      if (currentHour >= 0 && currentHour <= 5) {
        this.logger.warn(
          `Anomaly Detected: User ${payload.userId} logged in at an unusual hour: ${currentHour}:00`,
        );
      }

      // Check for burst logins (e.g., > 5 in 1 minute)
      const burstKey = `burst:login:${payload.tenantId}:${payload.userId}`;
      const loginCount = await this.redisService.incr(burstKey);
      if (loginCount === 1) {
        await this.redisService.expire(burstKey, 60);
      }
      if (loginCount > 5) {
        this.logger.warn(
          `Anomaly Detected: Burst logins for user ${payload.userId} (${loginCount} attempts in 1 min)`,
        );
      }

      const loginEvent = this.loginEventRepo.create({
        tenantId: payload.tenantId,
        userId: payload.userId,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
        deviceFingerprint: payload.deviceFingerprint,
        country,
        city,
      });

      await this.loginEventRepo.save(loginEvent);
    } catch (err) {
      this.logger.error('Failed to log login event', err);
    }
  }
}
