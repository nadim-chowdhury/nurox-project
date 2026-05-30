import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { TenantConnectionService } from './tenant-connection.service';
import { AutoSeedService } from './seeds/auto-seed.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('app.nodeEnv') === 'production';
        const dockerBootstrap = process.env.DOCKER_DB_BOOTSTRAP === 'true';

        return {
          type: 'postgres' as const,
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.username'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.name'),
          autoLoadEntities: true,
          // SAFETY: synchronize is ALWAYS false in production.
          // In production, use TypeORM migrations exclusively.
          synchronize: isProduction
            ? false
            : config.get<boolean>('database.synchronize'),
          logging: config.get<boolean>('database.logging'),
          ssl:
            config.get<string>('database.ssl') === 'true' ||
            (config.get<string>('database.host') !== 'localhost' &&
              config.get<string>('database.host') !== '127.0.0.1' &&
              config.get<string>('database.ssl') !== 'false')
              ? { rejectUnauthorized: false }
              : false,
          // Production: run migrations on boot (path relative to compiled database.module.js)
          migrations:
            isProduction && !dockerBootstrap
              ? [join(__dirname, 'migrations', '*.js')]
              : [],
          migrationsRun: isProduction && !dockerBootstrap,
        };
      },
    }),
  ],
  providers: [TenantConnectionService, AutoSeedService],
  exports: [TenantConnectionService],
})
export class DatabaseModule {}
