import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TenantConnectionService } from './tenant-connection.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('database.synchronize'),
        logging: config.get<boolean>('database.logging'),
        ssl:
          config.get<string>('database.ssl') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        // Production: use migrations, never synchronize
        // migrations: ['dist/database/migrations/*.js'],
      }),
    }),
  ],
  providers: [TenantConnectionService],
  exports: [TenantConnectionService],
})
export class DatabaseModule {}
