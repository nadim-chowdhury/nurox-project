import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AttendanceService } from './attendance.service';
import { AttendanceMethod } from './entities/attendance.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';

@Controller('attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('qr')
  async getCheckInQr(@Body('employeeId') employeeId: string) {
    const token = await this.attendanceService.generateCheckInQr(employeeId);
    return { token };
  }

  @Post('check-in')
  async checkIn(
    @Body()
    dto: {
      employeeId: string;
      method: AttendanceMethod;
      token?: string;
      location?: any;
      timestamp?: string;
    },
  ) {
    if (dto.method === AttendanceMethod.QR && dto.token) {
      return this.attendanceService.checkInViaQr(dto.employeeId, dto.token);
    }
    return this.attendanceService.recordAttendance(
      dto.employeeId,
      dto.method,
      'IN',
      dto.location,
      dto.timestamp ? new Date(dto.timestamp) : undefined,
    );
  }

  @Post('check-out')
  async checkOut(
    @Body()
    dto: {
      employeeId: string;
      method: AttendanceMethod;
      location?: any;
      timestamp?: string;
    },
  ) {
    return this.attendanceService.recordAttendance(
      dto.employeeId,
      dto.method,
      'OUT',
      dto.location,
      dto.timestamp ? new Date(dto.timestamp) : undefined,
    );
  }

  @Get('team')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  async getTeamAttendance(@Query('date') date: string) {
    return this.attendanceService.getTeamAttendance(
      date || new Date().toISOString().split('T')[0],
    );
  }

  @Post('bulk')
  @RequirePermissions(Permission.HR_CREATE_EMPLOYEE)
  async bulkImportAttendance(@Body() records: Record<string, unknown>[]) {
    return this.attendanceService.bulkImport(records);
  }

  @Get('report')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  async getAttendanceReport(
    @Query('month') month: number,
    @Query('year') year: number,
    @Res() res: Response,
  ) {
    return this.attendanceService.generateMonthlyReport(month, year, res);
  }
}
