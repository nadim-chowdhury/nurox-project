import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { databaseConfig, appConfig } from '../../config/app.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Department } from '../../modules/hr/entities/department.entity';
import { Employee } from '../../modules/hr/entities/employee.entity';
import { Role } from '../../modules/auth/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Tenant } from '../../modules/system/entities/tenant.entity';
import { Branch } from '../../modules/system/entities/branch.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
        ssl:
          process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }),
    }),
    TypeOrmModule.forFeature([
      Department,
      Employee,
      Role,
      User,
      Tenant,
      Branch,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
