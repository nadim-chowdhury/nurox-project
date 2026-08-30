import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { FleetService } from '../services/fleet.service';
import {
  CreateVehicleDto,
  CreateFuelLogDto,
  CreateTripLogDto,
  createVehicleSchema,
  fuelLogSchema,
  tripLogSchema,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsePipes, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('fleet')
@UseInterceptors(AuditLogInterceptor)
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get('vehicles')
  async getVehicles(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.fleetService.findAllVehicles(
      tenantId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('fuel-logs')
  async getFuelLogs(
    @CurrentTenant() tenantId: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.fleetService.findAllFuelLogs(
      tenantId,
      vehicleId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('trip-logs')
  async getTripLogs(
    @CurrentTenant() tenantId: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.fleetService.findAllTripLogs(
      tenantId,
      vehicleId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('vehicles')
  @UsePipes(new ZodValidationPipe(createVehicleSchema))
  async createVehicle(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.fleetService.createVehicle(tenantId, dto);
  }

  @Post('fuel-logs')
  @UsePipes(new ZodValidationPipe(fuelLogSchema))
  async logFuel(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateFuelLogDto,
  ) {
    return this.fleetService.logFuel(tenantId, dto);
  }

  @Post('trip-logs')
  @UsePipes(new ZodValidationPipe(tripLogSchema))
  async logTrip(
    @CurrentTenant() tenantId: string,
    @Body() dto: CreateTripLogDto,
  ) {
    return this.fleetService.logTrip(tenantId, dto);
  }

  @Post('optimize-route')
  async optimizeRoute(
    @CurrentTenant() tenantId: string,
    @Body('stops') stops: string[],
  ) {
    return this.fleetService.optimizeRoute(tenantId, stops);
  }
}
