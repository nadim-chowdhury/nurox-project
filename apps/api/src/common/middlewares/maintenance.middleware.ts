import {
  Injectable,
  NestMiddleware,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly redis: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const isMaintenance = await this.redis.get('system:maintenance:enabled');

    if (isMaintenance === 'true') {
      const eta = await this.redis.get('system:maintenance:eta');
      const reason = await this.redis.get('system:maintenance:reason');

      throw new ServiceUnavailableException({
        message: 'System is currently under maintenance.',
        reason: reason || 'Routine updates',
        eta: eta || 'Unknown',
        statusCode: 503,
      });
    }

    next();
  }
}
