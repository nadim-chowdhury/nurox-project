import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceRecord } from './entities/attendance.entity';
import { Holiday } from './entities/holiday.entity';
import { RegularizationRequest } from './entities/regularization.entity';
import {
  ShiftAssignment,
  ShiftRotation,
} from './entities/shift-assignment.entity';
import { Employee } from '../hr/entities/employee.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceRecord,
      Holiday,
      Employee,
      RegularizationRequest,
      ShiftAssignment,
      ShiftRotation,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret')!,
      }),
    }),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
