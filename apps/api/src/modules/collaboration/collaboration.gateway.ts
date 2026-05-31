import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: 'collaboration',
  cors: { origin: '*' },
})
@UseGuards(WsJwtGuard)
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CollaborationGateway.name);
  private activeUsers = new Map<string, Set<string>>(); // documentId -> Set of userId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to collaboration: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from collaboration: ${client.id}`);
    // Cleanup active users on disconnect
    this.activeUsers.forEach((users, docId) => {
      if (users.has(client.data.user?.id)) {
        users.delete(client.data.user?.id);
        this.broadcastPresence(docId);
      }
    });
  }

  @SubscribeMessage('joinDocument')
  handleJoinDocument(client: Socket, payload: { documentId: string }) {
    const { documentId } = payload;
    const userId = client.data.user?.id;
    const tenantId = client.data.user?.tenantId;

    if (!userId || !tenantId) return;

    client.join(`doc:${documentId}`);

    if (!this.activeUsers.has(documentId)) {
      this.activeUsers.set(documentId, new Set());
    }
    this.activeUsers.get(documentId)?.add(userId);

    this.logger.debug(`User ${userId} joined document ${documentId}`);
    this.broadcastPresence(documentId);
  }

  @SubscribeMessage('leaveDocument')
  handleLeaveDocument(client: Socket, payload: { documentId: string }) {
    const { documentId } = payload;
    const userId = client.data.user?.id;

    client.leave(`doc:${documentId}`);

    const users = this.activeUsers.get(documentId);
    if (users) {
      users.delete(userId);
      this.broadcastPresence(documentId);
    }
  }

  private broadcastPresence(documentId: string) {
    const usersSet = this.activeUsers.get(documentId);
    const users = Array.from(usersSet || []);
    this.server.to(`doc:${documentId}`).emit('presence', {
      documentId,
      activeUsers: users,
    });
  }
}
