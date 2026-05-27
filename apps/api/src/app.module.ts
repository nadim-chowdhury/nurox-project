import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as path from 'path';
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
  aiConfig,
} from './config/app.config';
import { validate } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { SystemModule } from './modules/system/system.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { SmsModule } from './modules/sms/sms.module';
import { TenantMiddleware } from './common/middlewares/tenant.middleware';
import { MaintenanceMiddleware } from './common/middlewares/maintenance.middleware';
import { CsrfMiddleware } from './common/middlewares/csrf.middleware';
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
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { BillingModule } from './modules/billing/billing.module';
import { SupportModule } from './modules/support/support.module';
import { AiModule } from './modules/ai/ai.module';
import { AutomationModule } from './modules/automation/automation.module';
import { PosModule } from './modules/pos/pos.module';
import { ManufacturingModule } from './modules/manufacturing/manufacturing.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health/health.module';

import { SentryModule } from '@sentry/nestjs/setup';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClsModule } from 'nestjs-cls';
import { ClsMiddleware } from './common/middlewares/cls.middleware';
import { TenantSubscriber } from './common/subscribers/tenant.subscriber';
import { TenantGuard } from './common/guards/tenant.guard';
import { ModuleGuard } from './common/guards/module.guard';
import { ApiKeyThrottlerGuard } from './common/guards/api-key-throttler.guard';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';

@Module({
  imports: [
    SentryModule.forRoot(),
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
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
        aiConfig,
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
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'req.body.newPassword',
              'req.body.currentPassword',
              'req.body.email',
              'req.body.phone',
              'req.body.nationalId',
              'req.body.accountNumber',
              'req.body.routingNumber',
            ],
            censor: '[REDACTED]',
          },
        },
      }),
      inject: [ConfigService],
    }),

    // ─── Rate Limiting (Redis-backed in production) ──────────────
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          { name: 'short', ttl: 1000, limit: 10 }, // 10 req/sec burst
          { name: 'medium', ttl: 60000, limit: 200 }, // 200 req/min sustained
        ],
        storage: new ThrottlerStorageRedisService({
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        }),
      }),
    }),

    // ─── Task Scheduling (cron jobs) ─────────────────────────────
    ScheduleModule.forRoot(),

    // ─── Events ──────────────────────────────────────────────────
    EventEmitterModule.forRoot(),

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

    // ─── Bull Board for UI ───────────────────────────────────────
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),

    // ─── GraphQL ─────────────────────────────────────────────────
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
        // SECURITY: playground and introspection disabled in production
        playground: config.get<string>('app.nodeEnv') !== 'production',
        introspection: config.get<string>('app.nodeEnv') !== 'production',
        path: '/graphql',
      }),
    }),

    // ─── Core Infrastructure ─────────────────────────────────────
    DatabaseModule,
    SystemModule,
    RedisModule,
    MailerModule,
    SmsModule,
    CommonModule,
    HealthModule,

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
    NotificationsModule,
    ChatModule,
    IntegrationsModule,
    BillingModule,
    SupportModule,
    AiModule,
    AutomationModule,
    PosModule,
    ManufacturingModule,
    FleetModule,
    ComplianceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global rate limit guard — applies to all endpoints
    { provide: APP_GUARD, useClass: ApiKeyThrottlerGuard },
    { provide: APP_GUARD, useClass: ModuleGuard },
    { provide: APP_INTERCEPTOR, useClass: TenantInterceptor },
    TenantSubscriber,
    TenantGuard,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ClsMiddleware, MaintenanceMiddleware, CsrfMiddleware)
      .forRoutes('*');
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL },
        { path: 'api/docs', method: RequestMethod.ALL },
        { path: 'health', method: RequestMethod.GET },
        { path: 'billing/webhook/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes(
        // All tenant-scoped modules — every module that stores tenant data
        // MUST be listed here to enforce tenant isolation via middleware.
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
        { path: 'chat/(.*)', method: RequestMethod.ALL },
        { path: 'billing/(.*)', method: RequestMethod.ALL },
        // Previously missing — these modules were bypassing tenant scoping
        { path: 'documents/(.*)', method: RequestMethod.ALL },
        { path: 'assets/(.*)', method: RequestMethod.ALL },
        { path: 'reports/(.*)', method: RequestMethod.ALL },
        { path: 'support/(.*)', method: RequestMethod.ALL },
        { path: 'ai/(.*)', method: RequestMethod.ALL },
        { path: 'automation/(.*)', method: RequestMethod.ALL },
        { path: 'pos/(.*)', method: RequestMethod.ALL },
        { path: 'manufacturing/(.*)', method: RequestMethod.ALL },
        { path: 'fleet/(.*)', method: RequestMethod.ALL },
        { path: 'compliance/(.*)', method: RequestMethod.ALL },
        { path: 'integrations/(.*)', method: RequestMethod.ALL },
        { path: 'users/(.*)', method: RequestMethod.ALL },
      );
  }
}
