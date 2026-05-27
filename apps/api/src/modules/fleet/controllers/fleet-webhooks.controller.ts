import { Controller, Post, Body, Headers, Logger } from '@nestjs/common';
import { FleetGateway } from '../gateways/fleet.gateway';

@Controller('fleet/webhooks')
export class FleetWebhooksController {
  private readonly logger = new Logger(FleetWebhooksController.name);

  constructor(private readonly fleetGateway: FleetGateway) {}

  // Stub endpoint for hardware GPS devices to post updates
  @Post('gps')
  async handleGpsUpdate(
    @Headers('x-tenant-id') tenantId: string,
    @Body() payload: { vehicleId: string; lat: number; lng: number },
  ) {
    if (!tenantId || !payload.vehicleId || !payload.lat || !payload.lng) {
      return { status: 'error', message: 'Invalid payload' };
    }

    this.logger.log(
      `Received GPS update for vehicle ${payload.vehicleId}: [${payload.lat}, ${payload.lng}]`,
    );

    // Broadcast immediately to connected Mapbox clients
    this.fleetGateway.broadcastVehicleLocation(
      tenantId,
      payload.vehicleId,
      payload.lat,
      payload.lng,
    );

    return { status: 'acknowledged' };
  }
}
