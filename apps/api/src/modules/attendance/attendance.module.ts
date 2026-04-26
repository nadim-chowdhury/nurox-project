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
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
