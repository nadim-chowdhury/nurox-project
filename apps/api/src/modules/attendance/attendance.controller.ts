import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  ConflictException,
  UsePipes,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceMethod } from './entities/attendance.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { CheckModule } from '../../common/guards/module.guard';
import { RegularizationStatus } from './entities/regularization.entity';
import {
  CheckInDto,
  checkInSchema,
  CheckOutDto,
  checkOutSchema,
  regularizationRequestSchema,
  type RegularizationRequestDto,
  manualAttendanceEntrySchema,
  type ManualAttendanceEntryDto,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckModule('attendance')
@UseInterceptors(AuditLogInterceptor)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('qr')
  @ApiOperation({ summary: 'Generate check-in QR token' })
  async getCheckInQr(@Body('employeeId', ParseUUIDPipe) employeeId: string) {
    const token = await this.attendanceService.generateCheckInQr(employeeId);
    return { token };
  }

  @Post('check-in')
  @UsePipes(new ZodValidationPipe(checkInSchema))
  async checkIn(@Body() dto: CheckInDto) {
    if (dto.method === 'QR' && dto.token) {
      return this.attendanceService.checkInViaQr(dto.token);
    }
    if (!dto.employeeId) throw new ConflictException('Employee ID is required');
    return this.attendanceService.recordAttendance(
      dto.employeeId,
      dto.method as AttendanceMethod,
      'IN',
      dto.location,
      dto.timestamp ? new Date(dto.timestamp) : undefined,
    );
  }

  @Post('check-out')
  @UsePipes(new ZodValidationPipe(checkOutSchema))
  async checkOut(@Body() dto: CheckOutDto) {
    return this.attendanceService.recordAttendance(
      dto.employeeId,
      dto.method as AttendanceMethod,
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

  @Post('regularization')
  @UsePipes(new ZodValidationPipe(regularizationRequestSchema))
  async createRegularization(@Body() dto: RegularizationRequestDto) {
    return this.attendanceService.createRegularization(dto);
  }

  @Post('regularization/:id/approve')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  async approveRegularization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approvedById', ParseUUIDPipe) approvedById: string,
    @Body('status') status: RegularizationStatus,
  ) {
    return this.attendanceService.approveRegularization(
      id,
      approvedById,
      status,
    );
  }

  @Post('manual')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  @UsePipes(new ZodValidationPipe(manualAttendanceEntrySchema))
  async manualEntry(@Body() dto: ManualAttendanceEntryDto) {
    return this.attendanceService.manualHrEntry(
      dto.employeeId,
      dto.date,
      dto.checkIn ? new Date(dto.checkIn) : undefined,
      dto.checkOut ? new Date(dto.checkOut) : undefined,
      dto.reason,
    );
  }

  @Get('analytics')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  async getAnalytics(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.attendanceService.getAnalytics(month, year);
  }
}
