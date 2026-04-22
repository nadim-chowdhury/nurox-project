import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class ClsMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    const userId = user?.id || null;
    const tenantId = (req as any).tenantId || null;
    const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
    const userAgent = req.headers['user-agent'];

    this.cls.set('userId', userId);
    this.cls.set('tenantId', tenantId);
    this.cls.set('ipAddress', ipAddress);
    this.cls.set('userAgent', userAgent);

    next();
  }
}
