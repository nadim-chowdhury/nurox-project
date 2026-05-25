import {
  Injectable,
  NestMiddleware,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../../modules/redis/redis.service';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Exclude superadmin routes from maintenance mode
    if (req.path.startsWith('/superadmin')) {
      return next();
    }

    const isMaintenance = await this.redisService.get('global:maintenance');
    if (isMaintenance === 'true') {
      throw new ServiceUnavailableException(
        'System is currently under maintenance. Please try again later.',
      );
    }

    next();
  }
}
