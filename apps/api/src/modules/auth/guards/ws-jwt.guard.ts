import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      
      if (!authToken) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(authToken, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });

      // Attach user to the client object
      client.data.user = payload;
      return true;
    } catch (err) {
      this.logger.error(`WS Auth error: ${err.message}`);
      throw new WsException('Unauthorized');
    }
  }
}
