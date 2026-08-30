import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { FuelLog } from '../entities/fuel-log.entity';
import { TripLog } from '../entities/trip-log.entity';
import {
  CreateVehicleDto,
  CreateFuelLogDto,
  CreateTripLogDto,
} from '@repo/shared-schemas';

@Injectable()
export class FleetService {
  private readonly logger = new Logger(FleetService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(FuelLog) private readonly fuelRepo: Repository<FuelLog>,
    @InjectRepository(TripLog) private readonly tripRepo: Repository<TripLog>,
  ) {}

  async createVehicle(tenantId: string, dto: CreateVehicleDto) {
    const vehicle = this.vehicleRepo.create({
      tenantId,
      registrationNumber: dto.registrationNumber,
      make: dto.make,
      model: dto.model,
      fuelType: dto.fuelType,
      capacityKg: dto.capacityKg,
      insuranceExpiry: dto.insuranceExpiry
        ? new Date(dto.insuranceExpiry)
        : undefined,
      roadTaxExpiry: dto.roadTaxExpiry
        ? new Date(dto.roadTaxExpiry)
        : undefined,
    });
    return this.vehicleRepo.save(vehicle);
  }

  async logFuel(tenantId: string, dto: CreateFuelLogDto) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: dto.vehicleId, tenantId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const log = this.fuelRepo.create({
      tenantId,
      vehicleId: vehicle.id,
      odometer: dto.odometer,
      fuelQuantity: dto.fuelQuantity,
      cost: dto.cost,
    });

    return this.fuelRepo.save(log);
  }

  async logTrip(tenantId: string, dto: CreateTripLogDto) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: dto.vehicleId, tenantId },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    const trip = this.tripRepo.create({
      tenantId,
      vehicleId: vehicle.id,
      driverId: dto.driverId,
      origin: dto.origin,
      destination: dto.destination,
      distanceKm: dto.distanceKm,
    });

    return this.tripRepo.save(trip);
  }

  async findAllVehicles(tenantId: string, page = 1, limit = 50) {
    const [data, total] = await this.vehicleRepo.findAndCount({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllFuelLogs(
    tenantId: string,
    vehicleId?: string,
    page = 1,
    limit = 50,
  ) {
    const where: any = { tenantId };
    if (vehicleId) where.vehicleId = vehicleId;
    const [data, total] = await this.fuelRepo.findAndCount({
      where,
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllTripLogs(
    tenantId: string,
    vehicleId?: string,
    page = 1,
    limit = 50,
  ) {
    const where: any = { tenantId };
    if (vehicleId) where.vehicleId = vehicleId;
    const [data, total] = await this.tripRepo.findAndCount({
      where,
      relations: ['vehicle'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async optimizeRoute(tenantId: string, stops: string[]) {
    this.logger.log(
      `Optimizing route for ${stops.length} stops via stubbed Google Maps API`,
    );
    // Stub implementation of Google Maps Directions API Waypoint optimization
    return {
      status: 'OK',
      optimizedOrder: stops.map((_, i) => i), // Pretend it's optimized
      estimatedTotalDistanceKm: stops.length * 5.2,
      estimatedTotalMinutes: stops.length * 15,
    };
  }
}
