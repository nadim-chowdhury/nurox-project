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
import {
  createLeadSchema,
  updateLeadSchema,
  createDealSchema,
  updateDealSchema,
  type CreateLeadDto,
  type UpdateLeadDto,
  type CreateDealDto,
  type UpdateDealDto,
} from '@repo/shared-schemas';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { CheckModule } from '../../common/guards/module.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckModule('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('leads')
  @RequirePermissions(Permission.SALES_MANAGE_LEADS)
  createLead(@Body() dto: CreateLeadDto) {
    const parsed = createLeadSchema.parse(dto);
    return this.salesService.createLead(parsed as any);
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
    const parsed = updateLeadSchema.parse(dto);
    return this.salesService.updateLead(id, parsed as any);
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
    const parsed = createDealSchema.parse(dto);
    return this.salesService.createDeal(parsed as any);
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
    const parsed = updateDealSchema.parse(dto);
    return this.salesService.updateDeal(id, parsed as any);
  }

  @Delete('deals/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SALES_MANAGE_DEALS)
  removeDeal(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.removeDeal(id);
  }
}
