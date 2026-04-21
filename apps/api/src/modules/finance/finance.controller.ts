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
import { InvoiceStatus } from './entities/invoice.entity';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ─── ACCOUNTS ───────────────────────────────────────────────

  @Post('accounts')
  createAccount(@Body() dto: CreateAccountDto) {
    return this.financeService.createAccount(dto);
  }

  @Get('accounts')
  findAllAccounts() {
    return this.financeService.findAllAccounts();
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

  // ─── INVOICES ───────────────────────────────────────────────

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

  // ─── JOURNALS ───────────────────────────────────────────────

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
}
