import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';

@Controller('payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('structures')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  createStructure(@Body() dto: any) {
    return this.payrollService.createStructure(dto);
  }

  @Get('structures')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  findAllStructures() {
    return this.payrollService.findAllStructures();
  }

  @Post('assignments')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  assignStructure(
    @Body('employeeId') employeeId: string,
    @Body('structureId') structureId: string,
  ) {
    return this.payrollService.assignStructure(employeeId, structureId);
  }

  @Get('tax-configs')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  findAllTaxConfigs() {
    return this.payrollService.findAllTaxConfigs();
  }

  @Post('tax-configs')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  createTaxConfig(@Body() dto: any) {
    return this.payrollService.createTaxConfig(dto);
  }

  @Post('runs')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  createRun(@Body('period') period: string) {
    return this.payrollService.createRun(period);
  }

  @Post('runs/:id/process')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  processRun(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.processRun(id);
  }

  @Post('runs/:id/approve')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  approveRun(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.approveRun(id);
  }

  @Post('runs/:id/finalize')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  finalizeRun(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.finalizeRun(id);
  }

  @Post('runs/:id/publish')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  publishPayslips(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.publishPayslips(id);
  }

  @Get('runs/:id/beftn')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  async exportBeftn(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const content = await this.payrollService.generateBeftnExport(id);
    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename=beftn-export-${id}.txt`,
    });
    res.send(content);
  }

  @Get('me/payslips')
  getMyPayslips(@Query('employeeId') employeeId: string) {
    return this.payrollService.getPayslipsByEmployee(employeeId);
  }

  @Get('payslips/run/:runId')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  getPayslipsByRun(@Param('runId', ParseUUIDPipe) runId: string) {
    return this.payrollService.getPayslipsByRun(runId);
  }

  @Get('payslips/:id/download')
  @RequirePermissions(Permission.HR_VIEW_EMPLOYEES)
  async getDownloadUrl(@Param('id', ParseUUIDPipe) id: string) {
    const url = await this.payrollService.getPayslipDownloadUrl(id);
    return { url };
  }

  @Get('payslips/:id/pdf')
  async getPayslipPdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.payrollService.getPayslipPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=payslip-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
