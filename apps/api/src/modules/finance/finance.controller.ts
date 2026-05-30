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
  UsePipes,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckModule } from '../../common/guards/module.guard';
import { InvoiceStatus } from './entities/invoice.entity';
import { BillStatus } from './entities/bill.entity';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import {
  billSchema,
  taxRateSchema,
  accountSchema,
  invoiceSchema,
  journalEntrySchema,
  type BillDto,
  type TaxRateDto,
  type AccountDto,
  type InvoiceDto,
  type JournalEntryDto,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('finance')
@UseGuards(JwtAuthGuard)
@CheckModule('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('accounts')
  @UsePipes(new ZodValidationPipe(accountSchema))
  createAccount(@Body() dto: AccountDto) {
    return this.financeService.createAccount(dto as any);
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
  @UsePipes(new ZodValidationPipe(accountSchema.partial()))
  updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<AccountDto>,
  ) {
    return this.financeService.updateAccount(id, dto as any);
  }

  @Delete('accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeAccount(id);
  }

  @Post('invoices')
  @UsePipes(new ZodValidationPipe(invoiceSchema))
  createInvoice(@Body() dto: InvoiceDto) {
    return this.financeService.createInvoice(dto as any);
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

  @Get('invoices/:id/export/pdf')
  async exportInvoicePdf(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.financeService.exportInvoicePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @Post('credit-notes')
  createCreditNote(@Body() dto: any) {
    return this.financeService.createCreditNote(dto);
  }

  @Patch('invoices/:id/status')
  updateInvoiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: InvoiceStatus,
  ) {
    return this.financeService.updateInvoiceStatus(id, status);
  }

  @Post('invoices/:id/convert-proforma')
  convertProforma(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.convertProformaToInvoice(id);
  }

  @Post('recurring-invoices')
  createRecurringInvoice(@Body() dto: any) {
    return this.financeService.createRecurringInvoice(dto);
  }

  @Get('recurring-invoices')
  findAllRecurringInvoices() {
    return this.financeService.findAllRecurringInvoices();
  }

  @Get('recurring-invoices/:id')
  findRecurringInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findRecurringInvoiceById(id);
  }

  @Patch('recurring-invoices/:id')
  updateRecurringInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.financeService.updateRecurringInvoice(id, dto);
  }

  @Delete('recurring-invoices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRecurringInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeRecurringInvoice(id);
  }

  @Post('expense-claims')
  createExpenseClaim(@Body() dto: any) {
    return this.financeService.createExpenseClaim(dto);
  }

  @Get('expense-claims')
  findAllExpenseClaims() {
    return this.financeService.findAllExpenseClaims();
  }

  @Get('expense-claims/:id')
  findExpenseClaim(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findExpenseClaimById(id);
  }

  @Post('expense-claims/:id/approve')
  approveExpenseClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('approverId') approverId: string,
  ) {
    return this.financeService.approveExpenseClaim(id, approverId);
  }

  @Post('expense-claims/:id/reject')
  rejectExpenseClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.financeService.rejectExpenseClaim(id, reason);
  }

  @Post('expense-claims/:id/pay')
  payExpenseClaim(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.payExpenseClaim(id);
  }

  @Post('petty-cash/funds')
  createPettyCashFund(@Body() dto: any) {
    return this.financeService.createPettyCashFund(dto);
  }

  @Get('petty-cash/funds')
  findAllPettyCashFunds() {
    return this.financeService.findAllPettyCashFunds();
  }

  @Post('petty-cash/transactions')
  recordPettyCashTransaction(@Body() dto: any) {
    return this.financeService.recordPettyCashTransaction(dto);
  }

  @Get('petty-cash/funds/:id/transactions')
  findPettyCashTransactions(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findPettyCashTransactions(id);
  }

  @Post('bank-accounts')
  createBankAccount(@Body() dto: any) {
    return this.financeService.createBankAccount(dto);
  }

  @Get('bank-accounts')
  findAllBankAccounts() {
    return this.financeService.findAllBankAccounts();
  }

  @Get('bank-accounts/:id/transactions')
  findBankTransactions(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findBankTransactions(id);
  }

  @Get('bank-accounts/:id/unreconciled-journals')
  findUnreconciledJournals(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findUnreconciledJournalLines(id);
  }

  @Post('bank-accounts/:id/auto-match')
  autoMatch(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.autoMatchTransactions(id);
  }

  @Get('bank-accounts/:id/reconciliation-report')
  getReconciliationReport(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.getReconciliationReport(id);
  }

  @Delete('invoices/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeInvoice(id);
  }

  @Post('journals')
  @UsePipes(new ZodValidationPipe(journalEntrySchema))
  createJournal(@Body() dto: JournalEntryDto) {
    return this.financeService.createJournalEntry(dto as any);
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

  @Post('journals/:id/review')
  reviewJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.reviewJournal(id);
  }

  @Post('journals/:id/approve')
  approveJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.approveJournal(id);
  }

  @Post('journals/:id/post')
  postJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.postJournal(id);
  }

  @Post('journals/:id/reject')
  rejectJournal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.financeService.rejectJournal(id, reason);
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
  @UsePipes(new ZodValidationPipe(billSchema))
  createBill(@Body() dto: BillDto) {
    return this.financeService.createBill(dto as any);
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
  getTrialBalance(
    @Query('asOfDate') asOfDate?: string,
    @Query('comparativeDate') comparativeDate?: string,
  ) {
    return this.financeService.getTrialBalance(asOfDate, comparativeDate);
  }

  @Post('periods/:id/reopen')
  reopenPeriod(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.reopenPeriod(id);
  }

  @Get('reports/ar-aging')
  getARAgingReport() {
    return this.financeService.getARAgingReport();
  }

  @Get('reports/ap-aging')
  getAPAgingReport() {
    return this.financeService.getAPAgingReport();
  }

  @Post('payments')
  recordPayment(@Body() dto: any) {
    return this.financeService.recordPayment(dto);
  }

  @Get('payments/:id/export/tds-challan')
  async exportTDSChallan(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const buffer = await this.financeService.exportTDSChallan(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=tds-challan-${id}.pdf`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
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

  @Get('reports/vat-return')
  getVATReturn(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.computeVATReturn(startDate, endDate);
  }

  @Post('reminders/schedule')
  scheduleReminders() {
    return this.financeService.scheduleARReminders();
  }

  @Post('periods/:id/close')
  closePeriod(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.closePeriod(id);
  }

  @Post('revalue-currency')
  revalueCurrency(@Body('asOfDate') asOfDate: string) {
    return this.financeService.revalueForeignCurrencyBalances(asOfDate);
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
  @UsePipes(new ZodValidationPipe(taxRateSchema))
  createTaxRate(@Body() dto: TaxRateDto) {
    return this.financeService.createTaxRate(dto as any);
  }

  @Get('tax-rates')
  findAllTaxRates() {
    return this.financeService.findAllTaxRates();
  }

  @Patch('tax-rates/:id')
  @UsePipes(new ZodValidationPipe(taxRateSchema.partial()))
  updateTaxRate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<TaxRateDto>,
  ) {
    return this.financeService.updateTaxRate(id, dto as any);
  }
}
