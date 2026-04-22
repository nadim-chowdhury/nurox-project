import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import {
  leaveRequestSchema,
  type LeaveRequestDto,
} from '@repo/shared-schemas';
import { LeaveRequestStatus } from './entities/leave.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';

@Controller('leave')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get()
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  async getLeaveRequests() {
    return this.leaveService.findAllLeaveRequests();
  }

  @Post('apply')
  async applyLeave(@Body() dto: LeaveRequestDto) {
    const parsed = leaveRequestSchema.parse(dto);
    return this.leaveService.applyLeave(parsed);
  }

  @Get('balances/:employeeId')
  async getLeaveBalances(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.leaveService.getLeaveBalances(employeeId);
  }

  @Patch(':id/approve')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  async approveLeave(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: LeaveRequestStatus,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.leaveService.approveLeave(id, approvedBy, status);
  }
}
