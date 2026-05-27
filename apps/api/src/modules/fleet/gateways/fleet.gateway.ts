import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict to frontend domain
  },
  namespace: '/fleet',
})
export class FleetGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(FleetGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected for fleet tracking: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from fleet tracking: ${client.id}`);
  }

  // Method to be called by a webhook when a GPS tracker posts new coordinates
  broadcastVehicleLocation(
    tenantId: string,
    vehicleId: string,
    lat: number,
    lng: number,
  ) {
    this.server.emit(`location-update-${tenantId}`, {
      vehicleId,
      lat,
      lng,
      timestamp: new Date(),
    });
    this.logger.debug(
      `Broadcasted location for vehicle ${vehicleId} to tenant ${tenantId}`,
    );
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    client.emit('pong', { message: 'Fleet gateway is active' });
  }
}
