import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { databaseConfig, appConfig } from '../../config/app.config';
import { DatabaseModule } from '../database.module';
import { Department } from '../../modules/hr/entities/department.entity';
import { Employee } from '../../modules/hr/entities/employee.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Department, Employee]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
