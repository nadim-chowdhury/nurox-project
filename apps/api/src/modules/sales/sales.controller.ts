import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('leads')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  createLead(@Body() dto: CreateLeadDto) {
    return this.salesService.createLead(dto);
  }

  @Get('leads')
  @RequirePermissions(Permission.SALES_VIEW_LEADS)
  findAllLeads() {
    return this.salesService.findAllLeads();
  }

  @Get('leads/:id')
  @RequirePermissions(Permission.SALES_VIEW_LEADS)
  findLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findLeadById(id);
  }

  @Patch('leads/:id')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  updateLead(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.salesService.updateLead(id, dto);
  }

  @Delete('leads/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  removeLead(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeLead(id);
  }

  @Post('deals')
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  createDeal(@Body() dto: CreateDealDto) {
    return this.salesService.createDeal(dto);
  }

  @Get('deals')
  @RequirePermissions(Permission.SALES_VIEW_DEALS)
  findAllDeals() {
    return this.salesService.findAllDeals();
  }

  @Get('deals/:id')
  @RequirePermissions(Permission.SALES_VIEW_DEALS)
  findDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findDealById(id);
  }

  @Patch('deals/:id')
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  updateDeal(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.salesService.updateDeal(id, dto);
  }

  @Delete('deals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  removeDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeDeal(id);
  }
}
