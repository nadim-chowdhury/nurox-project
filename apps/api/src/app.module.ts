import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { SystemModule } from './modules/system/system.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './modules/redis/redis.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { TenantMiddleware } from './common/middlewares/tenant.middleware';
import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { HrModule } from './modules/hr/hr.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { FinanceModule } from './modules/finance/finance.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SalesModule } from './modules/sales/sales.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';

@Module({
  imports: [
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
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true, // fail on first missing var
      },
    }),

    DatabaseModule,
    SystemModule,
    RedisModule,
    MailerModule,

    AuthModule,
    UsersModule,

    HrModule,
    PayrollModule,
    FinanceModule,
    InventoryModule,
    SalesModule,
    ProjectsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude(
        { path: 'auth/(.*)', method: RequestMethod.ALL }, // auth endpoints are typically global
        { path: 'api/docs', method: RequestMethod.ALL },
      )
      // Apply the middleware to all feature modules enforcing multi-tenancy
      .forRoutes(
        { path: 'hr/(.*)', method: RequestMethod.ALL },
        { path: 'finance/(.*)', method: RequestMethod.ALL },
        { path: 'inventory/(.*)', method: RequestMethod.ALL },
        { path: 'projects/(.*)', method: RequestMethod.ALL },
        { path: 'sales/(.*)', method: RequestMethod.ALL },
        { path: 'payroll/(.*)', method: RequestMethod.ALL },
        { path: 'system/(.*)', method: RequestMethod.ALL },
        { path: 'analytics/(.*)', method: RequestMethod.ALL },
      );
  }
}
