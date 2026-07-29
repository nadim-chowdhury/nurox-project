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
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { FinanceService } from './finance.service';
import { BankReconciliationService } from './services/bank-reconciliation.service';
import { PaymentBatchService } from './services/payment-batch.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckModule } from '../../common/guards/module.guard';
import { InvoiceStatus } from './entities/invoice.entity';
import { BillStatus } from './entities/bill.entity';
import {
  billSchema,
  taxRateSchema,
  accountSchema,
  invoiceSchema,
  journalEntrySchema,
  pettyCashTransactionSchema,
  paymentSchema,
  type BillDto,
  type TaxRateDto,
  type AccountDto,
  type InvoiceDto,
  type JournalEntryDto,
  type PettyCashTransactionDto,
  type PaymentDto,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuditLogInterceptor } from '../../common/interceptors/audit-log.interceptor';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('finance')
@UseGuards(JwtAuthGuard)
@CheckModule('finance')
@UseInterceptors(AuditLogInterceptor)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly reconciliationService: BankReconciliationService,
    private readonly paymentBatchService: PaymentBatchService,
  ) {}

  // ─── Chart of Accounts ───────────────────────────────────────
  @Post('accounts')
  @ApiOperation({ summary: 'Create a new chart of account' })
  @UsePipes(new ZodValidationPipe(accountSchema))
  createAccount(@Body() dto: AccountDto) {
    return this.financeService.createAccount(dto as any);
  }

  @Get('accounts')
  @ApiOperation({ summary: 'Get all accounts' })
  findAllAccounts() {
    return this.financeService.findAllAccounts();
  }

  @Get('accounts/tree')
  @ApiOperation({ summary: 'Get chart of accounts as a tree' })
  findAllAccountsTree() {
    return this.financeService.findAllAccountsTree();
  }

  @Get('accounts/:id')
  @ApiOperation({ summary: 'Get account by ID' })
  findAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findAccountById(id);
  }

  @Patch('accounts/:id')
  @ApiOperation({ summary: 'Update an account' })
  @UsePipes(new ZodValidationPipe(accountSchema.partial()))
  updateAccount(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<AccountDto>,
  ) {
    return this.financeService.updateAccount(id, dto as any);
  }

  @Delete('accounts/:id')
  @ApiOperation({ summary: 'Delete an account' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAccount(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeAccount(id);
  }

  // ─── Invoices ───────────────────────────────────────────────
  @Post('invoices')
  @ApiOperation({ summary: 'Create a new invoice' })
  @UsePipes(new ZodValidationPipe(invoiceSchema))
  createInvoice(@Body() dto: InvoiceDto) {
    return this.financeService.createInvoice(dto as any);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  findAllInvoices(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.financeService.findAllInvoices(page || 1, limit || 20);
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  findInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findInvoiceById(id);
  }

  @Patch('invoices/:id/status')
  @ApiOperation({ summary: 'Update invoice status' })
  updateInvoiceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: InvoiceStatus,
  ) {
    return this.financeService.updateInvoiceStatus(id, status);
  }

  @Post('invoices/:id/convert-proforma')
  @ApiOperation({ summary: 'Convert proforma to real invoice' })
  convertProforma(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.convertProformaToInvoice(id);
  }

  @Get('invoices/:id/pdf')
  @ApiOperation({ summary: 'Export invoice as PDF' })
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

  @Delete('invoices/:id')
  @ApiOperation({ summary: 'Delete an invoice' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeInvoice(id);
  }

  // ─── Journal Entries ────────────────────────────────────────
  @Post('journals')
  @ApiOperation({ summary: 'Create a manual journal entry' })
  @UsePipes(new ZodValidationPipe(journalEntrySchema))
  createJournal(@Body() dto: JournalEntryDto) {
    return this.financeService.createJournalEntry(dto as any);
  }

  @Get('journals')
  @ApiOperation({ summary: 'Get all journal entries' })
  findAllJournals(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.financeService.findAllJournals(page || 1, limit || 20);
  }

  @Get('journals/:id')
  @ApiOperation({ summary: 'Get journal entry by ID' })
  findJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findJournalById(id);
  }

  @Post('journals/:id/post')
  @ApiOperation({ summary: 'Post a journal entry to GL' })
  postJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.postJournal(id);
  }

  @Post('journals/:id/review')
  @ApiOperation({ summary: 'Mark journal entry as reviewed' })
  reviewJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.reviewJournal(id);
  }

  @Post('journals/:id/approve')
  @ApiOperation({ summary: 'Approve a journal entry' })
  approveJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.approveJournal(id);
  }

  @Post('journals/:id/reject')
  @ApiOperation({ summary: 'Reject a journal entry' })
  rejectJournal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.financeService.rejectJournal(id, reason);
  }

  @Delete('journals/:id')
  @ApiOperation({ summary: 'Delete a journal entry' })
  @HttpCode(HttpStatus.NO_CONTENT)
  removeJournal(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.removeJournal(id);
  }

  // ─── Bills ──────────────────────────────────────────────────
  @Post('bills')
  @ApiOperation({ summary: 'Create a new vendor bill' })
  @UsePipes(new ZodValidationPipe(billSchema))
  createBill(@Body() dto: BillDto) {
    return this.financeService.createBill(dto);
  }

  @Get('bills')
  @ApiOperation({ summary: 'Get all vendor bills' })
  findAllBills(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.financeService.findAllBills(page || 1, limit || 20);
  }

  @Get('bills/:id')
  @ApiOperation({ summary: 'Get bill by ID' })
  findBill(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findBillById(id);
  }

  @Patch('bills/:id/status')
  @ApiOperation({ summary: 'Update bill status' })
  updateBillStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: BillStatus,
  ) {
    return this.financeService.updateBillStatus(id, status);
  }

  // ─── Payments ───────────────────────────────────────────────
  @Post('payments')
  @ApiOperation({ summary: 'Record a payment for invoice or bill' })
  @UsePipes(new ZodValidationPipe(paymentSchema))
  recordPayment(@Body() dto: PaymentDto) {
    return this.financeService.recordPayment(dto as any);
  }

  @Get('payments/:id/export/tds-challan')
  @ApiOperation({ summary: 'Export TDS Challan as PDF' })
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

  // ─── Payment Batches ────────────────────────────────────────
  @Post('payments/batches')
  @ApiOperation({ summary: 'Create a new payment batch' })
  createPaymentBatch(
    @Body()
    dto: {
      bankAccountId: string;
      billIds: string[];
      paymentDate?: string;
      notes?: string;
    },
  ) {
    return this.paymentBatchService.createBatch({
      ...dto,
      paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
    });
  }

  @Get('payments/batches')
  @ApiOperation({ summary: 'Get all payment batches' })
  findAllPaymentBatches() {
    return this.paymentBatchService.findAll();
  }

  @Get('payments/batches/:id')
  @ApiOperation({ summary: 'Get payment batch by ID' })
  findOnePaymentBatch(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentBatchService.findOne(id);
  }

  @Get('payments/batches/:id/export')
  @ApiOperation({ summary: 'Export payment batch as bank instruction file' })
  async exportPaymentBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const { filename, content } =
      await this.paymentBatchService.generateBankInstructionFile(id);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename=${filename}`,
    });
    res.send(content);
  }

  @Post('payments/batches/:id/finalize')
  @ApiOperation({ summary: 'Finalize a payment batch' })
  finalizePaymentBatch(@Param('id', ParseUUIDPipe) id: string) {
    return this.paymentBatchService.finalizeBatch(id);
  }

  // ─── Reports ────────────────────────────────────────────────
  @Get('reports/trial-balance')
  @ApiOperation({ summary: 'Get trial balance report' })
  getTrialBalance(
    @Query('asOfDate') asOfDate?: string,
    @Query('comparativeDate') comparativeDate?: string,
  ) {
    return this.financeService.getTrialBalance(asOfDate, comparativeDate);
  }

  @Get('reports/income-statement')
  @ApiOperation({ summary: 'Get income statement (P&L)' })
  getIncomeStatement(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.getIncomeStatement(startDate, endDate);
  }

  @Get('reports/balance-sheet')
  @ApiOperation({ summary: 'Get balance sheet report' })
  getBalanceSheet(@Query('asOfDate') asOfDate: string) {
    return this.financeService.getBalanceSheet(asOfDate);
  }

  @Get('reports/cash-flow')
  @ApiOperation({ summary: 'Generate cash flow report' })
  getCashFlow(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.getCashFlowReport(startDate, endDate);
  }

  @Get('reports/vat-return')
  @ApiOperation({ summary: 'Get VAT return calculation' })
  getVatReturn(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.computeVATReturn(startDate, endDate);
  }

  @Get('reports/ar-aging')
  @ApiOperation({ summary: 'Generate Accounts Receivable aging report' })
  getARAgingReport() {
    return this.financeService.getARAgingReport();
  }

  @Get('reports/ap-aging')
  @ApiOperation({ summary: 'Generate Accounts Payable aging report' })
  getAPAgingReport() {
    return this.financeService.getAPAgingReport();
  }

  @Get('reports/budget-vs-actual')
  @ApiOperation({ summary: 'Generate budget vs actual report' })
  getBudgetVsActual(@Query('period') period: string) {
    return this.financeService.getBudgetVsActualReport(period);
  }

  @Get('reports/general-ledger/:accountId')
  @ApiOperation({ summary: 'Get general ledger for an account' })
  getGeneralLedger(
    @Param('accountId', ParseUUIDPipe) accountId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getGeneralLedger(
      accountId,
      page || 1,
      limit || 20,
      startDate,
      endDate,
    );
  }

  @Get('reports/export/trial-balance/pdf')
  @ApiOperation({ summary: 'Export trial balance as PDF' })
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
  @ApiOperation({ summary: 'Export trial balance as Excel' })
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

  // ─── Tax Rates ──────────────────────────────────────────────
  @Post('tax-rates')
  @ApiOperation({ summary: 'Create a tax rate' })
  @UsePipes(new ZodValidationPipe(taxRateSchema))
  createTaxRate(@Body() dto: TaxRateDto) {
    return this.financeService.createTaxRate(dto);
  }

  @Get('tax-rates')
  @ApiOperation({ summary: 'Get all tax rates' })
  findAllTaxRates() {
    return this.financeService.findAllTaxRates();
  }

  @Patch('tax-rates/:id')
  @ApiOperation({ summary: 'Update a tax rate' })
  @UsePipes(new ZodValidationPipe(taxRateSchema.partial()))
  updateTaxRate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<TaxRateDto>,
  ) {
    return this.financeService.updateTaxRate(id, dto);
  }

  // ─── Petty Cash ─────────────────────────────────────────────
  @Post('petty-cash/funds')
  @ApiOperation({ summary: 'Create a new petty cash fund' })
  createPettyCashFund(@Body() dto: Record<string, any>) {
    return this.financeService.createPettyCashFund(dto);
  }

  @Get('petty-cash/funds')
  @ApiOperation({ summary: 'Get all petty cash funds' })
  findAllPettyCashFunds() {
    return this.financeService.findAllPettyCashFunds();
  }

  @Post('petty-cash/transactions')
  @ApiOperation({ summary: 'Record a petty cash transaction' })
  @UsePipes(new ZodValidationPipe(pettyCashTransactionSchema))
  recordPettyCashTransaction(@Body() dto: PettyCashTransactionDto) {
    return this.financeService.recordPettyCashTransaction(dto as any);
  }

  @Get('petty-cash/funds/:id/transactions')
  @ApiOperation({ summary: 'Get transactions for a specific petty cash fund' })
  findPettyCashTransactions(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findPettyCashTransactions(id);
  }

  // ─── Banking & Reconciliation ───────────────────────────────
  @Post('bank-accounts')
  @ApiOperation({ summary: 'Register a new bank account' })
  createBankAccount(@Body() dto: Record<string, any>) {
    return this.financeService.createBankAccount(dto);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get all registered bank accounts' })
  findAllBankAccounts() {
    return this.financeService.findAllBankAccounts();
  }

  @Get('bank-accounts/:id/transactions')
  @ApiOperation({ summary: 'Get transactions for a bank account' })
  findBankTransactions(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findBankTransactions(id);
  }

  @Get('bank-accounts/:id/unreconciled-journals')
  @ApiOperation({
    summary: 'Get unreconciled journal lines for a bank account',
  })
  findUnreconciledJournals(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.findUnreconciledJournalLines(id);
  }

  @Post('bank-accounts/:id/auto-match')
  @ApiOperation({
    summary: 'Auto-match bank transactions with journal entries',
  })
  autoMatch(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.autoMatchTransactions(id);
  }

  @Get('bank-accounts/:id/reconciliation-report')
  @ApiOperation({ summary: 'Generate a bank reconciliation report' })
  getReconciliationReport(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.getReconciliationReport(id);
  }

  @Post('banking/:bankAccountId/import')
  @ApiOperation({ summary: 'Import bank statement transactions' })
  importStatement(
    @Param('bankAccountId', ParseUUIDPipe) bankAccountId: string,
    @Body('transactions') transactions: any[],
  ) {
    return this.financeService.importBankStatement(bankAccountId, transactions);
  }

  @Post('banking/reconcile/:transactionId')
  @ApiOperation({ summary: 'Manually reconcile a bank transaction' })
  reconcile(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @Body('journalEntryId', ParseUUIDPipe) journalEntryId: string,
  ) {
    return this.financeService.reconcileTransaction(
      transactionId,
      journalEntryId,
    );
  }

  @Get('banking/reconciliation-suggestions/:bankAccountId')
  @ApiOperation({ summary: 'Get automated reconciliation suggestions' })
  getReconciliationSuggestions(
    @Param('bankAccountId', ParseUUIDPipe) bankAccountId: string,
  ) {
    return this.reconciliationService.getSuggestions(bankAccountId);
  }

  @Post('banking/reconcile-match')
  @ApiOperation({ summary: 'Reconcile a suggested match' })
  reconcileMatch(
    @Body('transactionId', ParseUUIDPipe) transactionId: string,
    @Body('journalLineId', ParseUUIDPipe) journalLineId: string,
  ) {
    return this.reconciliationService.reconcile(transactionId, journalLineId);
  }

  // ─── Miscellaneous ──────────────────────────────────────────
  @Post('periods/:id/reopen')
  @ApiOperation({ summary: 'Reopen a closed financial period' })
  reopenPeriod(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.reopenPeriod(id);
  }

  @Post('periods/:id/close')
  @ApiOperation({ summary: 'Close a financial period' })
  closePeriod(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeService.closePeriod(id);
  }

  @Post('reminders/schedule')
  @ApiOperation({ summary: 'Schedule automated AR reminders' })
  scheduleReminders() {
    return this.financeService.scheduleARReminders();
  }

  @Post('revalue-currency')
  @ApiOperation({ summary: 'Revalue foreign currency balances' })
  revalueCurrency(@Body('asOfDate') asOfDate: string) {
    return this.financeService.revalueForeignCurrencyBalances(asOfDate);
  }
}
