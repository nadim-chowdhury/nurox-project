import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  databaseConfig,
  jwtConfig,
  redisConfig,
  appConfig,
  mailConfig,
  oauthConfig,
  s3Config,
} from './config/app.config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { SystemModule } from './modules/system/system.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { TenantMiddleware } from './common/middlewares/tenant.middleware';
import { UsersModule } from './modules/users/users.module';
import { HrModule } from './modules/hr/hr.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { RecruitmentModule } from './modules/recruitment/recruitment.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { FinanceModule } from './modules/finance/finance.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AssetsModule } from './modules/assets/assets.module';
import { ReportsModule } from './modules/reports/reports.module';

import { ClsModule } from 'nestjs-cls';
import { ClsMiddleware } from './common/middlewares/cls.middleware';

@Module({
  imports: [
    // ─── Configuration ───────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        jwtConfig,
        redisConfig,
        appConfig,
        mailConfig,
        oauthConfig,
        s3Config,
      ],
      validate, // Zod-based env validation (replaces Joi)
    }),

    // ─── CLS (AsyncLocalStorage) ─────────────────────────────────
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),

    // ─── Logging (Pino — structured JSON) ────────────────────────
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          transport:
            config.get<string>('app.nodeEnv') !== 'production'
              ? {
                  target: 'pino-pretty',
                  options: { colorize: true, singleLine: true },
                }
              : undefined,
          level:
            config.get<string>('app.nodeEnv') === 'production'
              ? 'info'
              : 'debug',
          autoLogging: true,
          customProps: (req: any) => ({
            tenantId: req.tenantId ?? 'system',
            correlationId: req.headers?.['x-correlation-id'] ?? undefined,
          }),
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie'],
            censor: '[REDACTED]',
          },
        },
      }),
      inject: [ConfigService],
    }),

    // ─── Rate Limiting (Redis-backed in production) ──────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 }, // 10 req/sec burst
      { name: 'medium', ttl: 60000, limit: 200 }, // 200 req/min sustained
    ]),

    // ─── Task Scheduling (cron jobs) ─────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Queue (BullMQ + Redis) ──────────────────────────────────
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        },
      }),
      inject: [ConfigService],
    }),

    // ─── Core Infrastructure ─────────────────────────────────────
    DatabaseModule,
    SystemModule,
    RedisModule,
    MailerModule,

    // ─── Feature Modules ─────────────────────────────────────────
    AuthModule,
    UsersModule,
    HrModule,
    AttendanceModule,
    LeaveModule,
    RecruitmentModule,
    PayrollModule,
    FinanceModule,
    InventoryModule,
    ProcurementModule,
    SalesModule,
    ProjectsModule,
    AnalyticsModule,
    DocumentsModule,
    AssetsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limit guard — applies to all endpoints
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClsMiddleware).forRoutes('*');
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'api/docs', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes(
        { path: 'hr/(.*)', method: RequestMethod.ALL },
        { path: 'attendance/(.*)', method: RequestMethod.ALL },
        { path: 'leave/(.*)', method: RequestMethod.ALL },
        { path: 'notifications/(.*)', method: RequestMethod.ALL },
        { path: 'recruitment/(.*)', method: RequestMethod.ALL },
        { path: 'finance/(.*)', method: RequestMethod.ALL },
        { path: 'inventory/(.*)', method: RequestMethod.ALL },
        { path: 'procurement/(.*)', method: RequestMethod.ALL },
        { path: 'projects/(.*)', method: RequestMethod.ALL },
        { path: 'sales/(.*)', method: RequestMethod.ALL },
        { path: 'payroll/(.*)', method: RequestMethod.ALL },
        { path: 'system/(.*)', method: RequestMethod.ALL },
        { path: 'analytics/(.*)', method: RequestMethod.ALL },
      );
  }
}
