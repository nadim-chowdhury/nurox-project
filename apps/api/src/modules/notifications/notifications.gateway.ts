import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger, UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHeader(client);
      if (!token) {
        throw new UnauthorizedException('Missing token');
      }

      const payload = await this.jwtService.verifyAsync(token);

      const tenantId = payload.tenantId;
      const userId = payload.sub;

      if (!tenantId || !userId) {
        throw new UnauthorizedException('Invalid payload');
      }

      // Join tenant room (broadcasts)
      client.join(`tenant:${tenantId}`);
      // Join user specific room (private notifications)
      client.join(`tenant:${tenantId}:user:${userId}`);

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error) {
      this.logger.error(`Connection rejected: ${client.id} - ${error.message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const authHeader =
      client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (!authHeader) return undefined;

    // Auth might be sent as "Bearer <token>" or just the token directly
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : authHeader;
  }
}
