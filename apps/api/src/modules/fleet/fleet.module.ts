import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { FuelLog } from './entities/fuel-log.entity';
import { TripLog } from './entities/trip-log.entity';
import { FleetService } from './services/fleet.service';
import { FleetController } from './controllers/fleet.controller';
import { FleetWebhooksController } from './controllers/fleet-webhooks.controller';
import { FleetGateway } from './gateways/fleet.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, FuelLog, TripLog])],
  controllers: [FleetController, FleetWebhooksController],
  providers: [FleetService, FleetGateway],
  exports: [FleetService],
})
export class FleetModule {}
