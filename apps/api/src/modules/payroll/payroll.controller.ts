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
} from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PayrollRun, Payslip } from './entities/payroll.entity';

@Controller('payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('runs')
  createRun(@Body() dto: Partial<PayrollRun>) {
    return this.payrollService.createRun(dto);
  }

  @Get('runs')
  findAllRuns(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.payrollService.findAllRuns(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('runs/:id')
  findRun(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.findRunById(id);
  }

  @Patch('runs/:id')
  updateRun(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<PayrollRun>,
  ) {
    return this.payrollService.updateRun(id, dto);
  }

  @Delete('runs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRun(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.removeRun(id);
  }

  @Post('payslips')
  createPayslip(@Body() dto: Partial<Payslip>) {
    return this.payrollService.createPayslip(dto);
  }

  @Get('payslips/run/:runId')
  findPayslipsByRun(@Param('runId', ParseUUIDPipe) runId: string) {
    return this.payrollService.findPayslipsByRun(runId);
  }

  @Get('payslips/employee/:employeeId')
  findPayslipsByEmployee(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.payrollService.findPayslipsByEmployee(employeeId);
  }

  @Get('payslips/:id')
  findPayslip(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.findPayslipById(id);
  }
}
