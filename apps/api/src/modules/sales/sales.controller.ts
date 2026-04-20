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
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  // ─── LEADS ──────────────────────────────────────────────────

  @Post('leads')
  createLead(@Body() dto: any) {
    return this.salesService.createLead(dto);
  }

  @Get('leads')
  findAllLeads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.salesService.findAllLeads(
      Number(page) || 1,
      Number(limit) || 20,
      search,
      status,
    );
  }

  @Get('leads/:id')
  findLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findLeadById(id);
  }

  @Patch('leads/:id')
  updateLead(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.salesService.updateLead(id, dto);
  }

  @Delete('leads/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeLead(id);
  }

  // ─── DEALS ──────────────────────────────────────────────────

  @Post('deals')
  createDeal(@Body() dto: any) {
    return this.salesService.createDeal(dto);
  }

  @Get('deals')
  findAllDeals(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.salesService.findAllDeals(
      Number(page) || 1,
      Number(limit) || 20,
      status,
    );
  }

  @Get('deals/:id')
  findDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findDealById(id);
  }

  @Patch('deals/:id')
  updateDeal(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.salesService.updateDeal(id, dto);
  }

  @Delete('deals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeDeal(id);
  }
}
