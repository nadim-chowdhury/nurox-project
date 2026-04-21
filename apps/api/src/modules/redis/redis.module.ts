import { Module, Global, Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from './redis.constants';

const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (config: ConfigService) => {
    const logger = new Logger('RedisClient');
    const client = new Redis({
      host: config.get<string>('redis.host'),
      port: config.get<number>('redis.port'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: null,
    });

    client.on('error', (err) => {
      logger.warn(`Redis connection error: ${err.message}`);
    });

    client.on('connect', () => {
      logger.log('Redis connected successfully');
    });

    return client;
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [redisProvider, RedisService],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
