import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Res,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { HrService } from './hr.service';
import { AttendanceService } from './attendance.service';
import {
  CreateEmployeeDto,
  OkrDto,
  TrainingDto,
  SkillDto,
  AttendanceRecordDto,
  LeaveRequestDto,
  createDepartmentSchema,
  updateDepartmentSchema,
  CreateDepartmentDto as CreateDepartmentSchemaDto,
  UpdateDepartmentDto as UpdateDepartmentSchemaDto,
} from '@repo/shared-schemas';
import { SalaryChangeReason } from './entities/salary-history.entity';
import { LeaveRequestStatus } from './entities/leave.entity';
import { AttendanceMethod } from './entities/attendance.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';

@Controller('hr')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrController {
  constructor(
    private readonly hrService: HrService,
    private readonly attendanceService: AttendanceService,
  ) {}

  // ─── ATTENDANCE ─────────────────────────────────────────────

  @Get('attendance/qr')
  async getCheckInQr(@Body('employeeId') employeeId: string) {
    const token = await this.attendanceService.generateCheckInQr(employeeId);
    return { token };
  }

  @Post('attendance/check-in')
  async checkIn(
    @Body()
    dto: {
      employeeId: string;
      method: AttendanceMethod;
      token?: string;
      location?: any;
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
    );
  }

  @Post('attendance/check-out')
  async checkOut(
    @Body()
    dto: {
      employeeId: string;
      method: AttendanceMethod;
      location?: any;
    },
  ) {
    return this.attendanceService.recordAttendance(
      dto.employeeId,
      dto.method,
      'OUT',
      dto.location,
    );
  }

  @Get('attendance/team')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  async getTeamAttendance(@Query('date') date: string) {
    return this.attendanceService.getTeamAttendance(
      date || new Date().toISOString().split('T')[0],
    );
  }

  // ─── LEAVE MANAGEMENT ────────────────────────────────────────

  @Post('leaves/apply')
  async applyLeave(@Body() dto: any) {
    return this.attendanceService.applyLeave(dto);
  }

  @Get('leaves/balances/:employeeId')
  async getLeaveBalances(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.attendanceService.getLeaveBalances(employeeId);
  }

  @Patch('leaves/:id/approve')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  async approveLeave(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: LeaveRequestStatus,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.attendanceService.approveLeave(id, approvedBy, status);
  }

  // ─── EMPLOYEES ──────────────────────────────────────────────

  @RequirePermissions(Permission.HR_CREATE_EMPLOYEE)
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(dto);
  }

  @Get('employees')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findAllEmployees(@Query() query: QueryEmployeeDto) {
    return this.hrService.findAllEmployees(query);
  }

  @Get('employees/:id')
  findEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findEmployeeById(id);
  }

  @Patch('employees/:id')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateEmployee(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.hrService.updateEmployee(id, dto);
  }

  @Post('employees/:id/salary')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  updateSalary(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newSalary') newSalary: number,
    @Body('reason') reason: SalaryChangeReason,
    @Body('comments') comments?: string,
  ) {
    return this.hrService.updateSalary(id, newSalary, reason, comments);
  }

  @Post('employees/:id/okr')
  @RequirePermissions(Permission.HR_MANAGE_PERFORMANCE)
  addOKR(@Param('id', ParseUUIDPipe) id: string, @Body() dto: OkrDto) {
    return this.hrService.addOKR(id, dto);
  }

  @Post('employees/:id/training')
  @RequirePermissions(Permission.HR_MANAGE_TRAINING)
  addTraining(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TrainingDto,
  ) {
    return this.hrService.addTraining(id, dto);
  }

  @Post('employees/:id/skill')
  @RequirePermissions(Permission.HR_MANAGE_SKILLS)
  addSkill(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SkillDto) {
    return this.hrService.addSkill(id, dto);
  }

  @Get('employees/:id/history')
  @RequirePermissions(Permission.HR_VIEW_HISTORY)
  getEmployeeHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.getEmployeeHistory(id);
  }

  @Get('trainings/:id/certificate')
  @RequirePermissions(Permission.HR_MANAGE_TRAINING)
  async getTrainingCertificate(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.hrService.getTrainingCertificate(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=certificate-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Delete('employees/:id')
  @RequirePermissions(Permission.HR_DELETE_EMPLOYEE)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeEmployee(id);
  }

  @Post('departments')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  createDepartment(@Body() dto: CreateDepartmentSchemaDto) {
    const parsed = createDepartmentSchema.parse(dto);
    return this.hrService.createDepartment(parsed);
  }

  @Get('departments')
  @RequirePermissions(Permission.HR_VIEW_DEPARTMENTS)
  findAllDepartments() {
    return this.hrService.findAllDepartments();
  }

  @Get('departments/:id')
  @RequirePermissions(Permission.HR_VIEW_DEPARTMENTS)
  findDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDepartmentById(id);
  }

  @Patch('departments/:id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  updateDepartment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentSchemaDto,
  ) {
    const parsed = updateDepartmentSchema.parse(dto);
    return this.hrService.updateDepartment(id, parsed);
  }

  @Delete('departments/:id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDepartment(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeDepartment(id);
  }

  @Post('designations')
  createDesignation(@Body() dto: CreateDesignationDto) {
    return this.hrService.createDesignation(dto);
  }

  @Get('designations')
  findAllDesignations() {
    return this.hrService.findAllDesignations();
  }

  @Get('designations/:id')
  findDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.findDesignationById(id);
  }

  @Patch('designations/:id')
  updateDesignation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDesignationDto,
  ) {
    return this.hrService.updateDesignation(id, dto);
  }

  @Delete('designations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDesignation(@Param('id', ParseUUIDPipe) id: string) {
    return this.hrService.removeDesignation(id);
  }
}
