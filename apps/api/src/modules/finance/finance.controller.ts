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
import { FinanceService } from './finance.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreateJournalEntryDto } from './dto/create-journal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckModule } from '../../common/guards/module.guard';
import { InvoiceStatus } from './entities/invoice.entity';
import { BillStatus } from './entities/bill.entity';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import {
  billSchema,
  taxRateSchema,
  type BillDto,
  type TaxRateDto,
} from '@repo/shared-schemas';

@Controller('finance')
@UseGuards(JwtAuthGuard)
@CheckModule('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('accounts')
  createAccount(@Body() dto: CreateAccountDto) {
    return this.financeService.createAccount(dto);
  }

  @Get('accounts')
  findAllAccounts() {
    return this.financeService.findAllAccounts();
  }

  @Get('accounts/tree')
  findAllAccountsTree() {
    return this.financeService.findAllAccountsTree();
  }

  @Get('accounts/:id')
  findAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findAccountById(id);
  }

  @Patch('accounts/:id')
  updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateAccountDto>,
  ) {
    return this.financeService.updateAccount(id, dto);
  }

  @Delete('accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeAccount(id);
  }

  @Post('invoices')
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Get('invoices')
  findAllInvoices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financeService.findAllInvoices(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('invoices/:id')
  findInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findInvoiceById(id);
  }

  @Patch('invoices/:id/status')
  updateInvoiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: InvoiceStatus,
  ) {
    return this.financeService.updateInvoiceStatus(id, status);
  }

  @Delete('invoices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeInvoice(id);
  }

  @Post('journals')
  createJournal(@Body() dto: CreateJournalEntryDto) {
    return this.financeService.createJournalEntry(dto);
  }

  @Get('journals')
  findAllJournals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.financeService.findAllJournals(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get('journals/:id')
  findJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findJournalById(id);
  }

  @Delete('journals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeJournal(id);
  }

  @Get('bills')
  findAllBills(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.financeService.findAllBills(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Post('bills')
  createBill(@Body() dto: BillDto) {
    const parsed = billSchema.parse(dto);
    return this.financeService.createBill(parsed as any);
  }

  @Get('bills/:id')
  findBill(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findBillById(id);
  }

  @Patch('bills/:id/status')
  updateBillStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: BillStatus,
  ) {
    return this.financeService.updateBillStatus(id, status);
  }

  @Get('reports/trial-balance')
  getTrialBalance() {
    return this.financeService.getTrialBalance();
  }

  @Get('reports/ar-aging')
  getARAgingReport() {
    return this.financeService.getARAgingReport();
  }

  @Get('reports/income-statement')
  getIncomeStatement(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.getIncomeStatement(startDate, endDate);
  }

  @Get('reports/balance-sheet')
  getBalanceSheet(@Query('asOfDate') asOfDate: string) {
    return this.financeService.getBalanceSheet(asOfDate);
  }

  @Get('reports/cash-flow')
  getCashFlow(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.getCashFlowReport(startDate, endDate);
  }

  @Get('reports/budget-vs-actual')
  getBudgetVsActual(@Query('period') period: string) {
    return this.financeService.getBudgetVsActualReport(period);
  }

  @Post('reminders/schedule')
  scheduleReminders() {
    return this.financeService.scheduleARReminders();
  }

  @Post('periods/:id/close')
  closePeriod(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.closePeriod(id);
  }

  @Get('reports/general-ledger/:accountId')
  getGeneralLedger(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getGeneralLedger(
      accountId,
      Number(page) || 1,
      Number(limit) || 20,
      startDate,
      endDate,
    );
  }

  @Get('reports/export/trial-balance/pdf')
  async exportTrialBalancePdf(@Res() res: Response) {
    const buffer = await this.financeService.exportTrialBalancePdf();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=trial-balance.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Get('reports/export/trial-balance/excel')
  async exportTrialBalanceExcel(@Res() res: Response) {
    const buffer = await this.financeService.exportTrialBalanceExcel();
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename=trial-balance.xlsx',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('banking/:bankAccountId/import')
  importStatement(
    @Param('bankAccountId', ParseUUIDPipe) bankAccountId: string,
    @Body('transactions') transactions: any[],
  ) {
    return this.financeService.importBankStatement(bankAccountId, transactions);
  }

  @Post('banking/reconcile/:transactionId')
  reconcile(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @Body('journalEntryId', ParseUUIDPipe) journalEntryId: string,
  ) {
    return this.financeService.reconcileTransaction(
      transactionId,
      journalEntryId,
    );
  }

  @Post('tax-rates')
  createTaxRate(@Body() dto: TaxRateDto) {
    const parsed = taxRateSchema.parse(dto);
    return this.financeService.createTaxRate(parsed as any);
  }

  @Get('tax-rates')
  findAllTaxRates() {
    return this.financeService.findAllTaxRates();
  }

  @Patch('tax-rates/:id')
  updateTaxRate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<TaxRateDto>,
  ) {
    return this.financeService.updateTaxRate(id, dto as any);
  }
}
