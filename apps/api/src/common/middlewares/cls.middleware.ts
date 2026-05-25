import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import * as crypto from 'crypto';

@Injectable()
export class ClsMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    const userId = user?.id || null;
    const tenantId = (req as any).tenantId || null;
    const ipAddress = (req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'];
    const correlationId =
      (req.headers['x-correlation-id'] as string) || crypto.randomUUID();

    this.cls.set('userId', userId);
    this.cls.set('tenantId', tenantId);
    this.cls.set('ipAddress', ipAddress);
    this.cls.set('userAgent', userAgent);
    this.cls.set('correlationId', correlationId);
    this.cls.set('requestStartTime', Date.now());

    res.setHeader('x-correlation-id', correlationId);

    next();
  }
}
