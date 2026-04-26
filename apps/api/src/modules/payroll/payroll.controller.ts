import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PayrollService } from './payroll.service';
import { AdvanceSalaryStatus } from './entities/advance-salary.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { CheckModule } from '../../common/guards/module.guard';
import {
  salaryStructureSchema,
  taxBracketSchema,
  type SalaryStructureDto,
  type TaxBracketDto,
} from '@repo/shared-schemas';

@Controller('payroll')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckModule('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('structures')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  createStructure(@Body() dto: SalaryStructureDto) {
    const parsed = salaryStructureSchema.parse(dto);
    return this.payrollService.createStructure(parsed);
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
  createTaxConfig(@Body() dto: TaxBracketDto) {
    const parsed = taxBracketSchema.parse(dto);
    return this.payrollService.createTaxConfig(parsed);
  }

  @Post('runs')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  createRun(@Body('period') period: string) {
    return this.payrollService.createRun(period);
  }

  @Post('runs/off-cycle')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  createOffCycleRun(
    @Body('employeeId') employeeId: string,
    @Body('period') period: string,
    @Body('type') type: string,
  ) {
    return this.payrollService.createOffCycleRun(employeeId, period, type);
  }

  @Post('overtime/:id/approve')
  @RequirePermissions(Permission.HR_UPDATE_EMPLOYEE)
  approveOvertime(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approvedById') approvedById: string,
  ) {
    // This should probably be in AttendanceService, but adding here for simplicity of Module 6 flow
    return this.payrollService.approveOvertime(id, approvedById);
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

  @Get('runs/:id/bank-letter')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  async downloadBankLetter(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.payrollService.generateBankLetterPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=bank-letter-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('runs/:id/summary')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  getPayrollSummary(@Param('id', ParseUUIDPipe) id: string) {
    return this.payrollService.getPayrollSummary(id);
  }

  @Get('runs/:id/comparison')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  getPayrollComparison(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('previousRunId') previousRunId: string,
  ) {
    return this.payrollService.getPayrollComparison(id, previousRunId);
  }

  @Get('runs/:id/bank-transfer')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  async exportBankTransfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const content = await this.payrollService.generateBankTransferFile(id);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=bank-transfer-${id}.csv`,
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

  @Post('advance-requests')
  createAdvanceRequest(@Body() dto: any) {
    return this.payrollService.createAdvanceRequest(dto);
  }

  @Patch('advance-requests/:id/status')
  @RequirePermissions(Permission.FINANCE_MANAGE_INVOICES)
  updateAdvanceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: AdvanceSalaryStatus,
  ) {
    return this.payrollService.updateAdvanceStatus(id, status);
  }
}
