import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody()
    data: { channelId: string; content: string; mentions: string[] },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = this.extractTokenFromHeader(client);
      const payload = await this.jwtService.verifyAsync(token);

      const message = await this.chatService.saveMessage(payload.tenantId, {
        channelId: data.channelId,
        senderId: payload.sub,
        content: data.content,
        mentions: data.mentions,
      });

      // Broadcast to all users in the channel room
      this.server.to(`channel:${data.channelId}`).emit('new_message', message);

      // If there are mentions, also emit specific push events
      if (data.mentions?.length) {
        data.mentions.forEach((userId) => {
          this.server
            .to(`tenant:${payload.tenantId}:user:${userId}`)
            .emit('mentioned', {
              channelId: data.channelId,
              messageId: message.id,
              senderId: payload.sub,
            });
        });
      }

      return message;
    } catch (e) {
      this.logger.error('Failed to send message', e);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage('join_channel')
  async handleJoinChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`channel:${data.channelId}`);
    return { success: true, channelId: data.channelId };
  }

  @SubscribeMessage('leave_channel')
  async handleLeaveChannel(
    @MessageBody() data: { channelId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`channel:${data.channelId}`);
    return { success: true, channelId: data.channelId };
  }

  private extractTokenFromHeader(client: Socket): string {
    const authHeader =
      client.handshake.auth?.token || client.handshake.headers?.authorization;
    if (!authHeader) throw new Error('No token');
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : authHeader;
  }
}
