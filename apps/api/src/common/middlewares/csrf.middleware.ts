import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate a token if one doesn't exist
    if (!req.cookies['csrf-token']) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie('csrf-token', token, {
        httpOnly: false, // Must be readable by frontend to send in header
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      // Attach to req for the current request
      req.cookies['csrf-token'] = token;
    }

    const path = req.originalUrl ?? req.url ?? '';
    const csrfExempt =
      path.includes('/auth/login') ||
      path.includes('/auth/register') ||
      path.includes('/auth/refresh') ||
      path.includes('/auth/magic-link');

    // On mutations, verify the token
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (!safeMethods.includes(req.method) && !csrfExempt) {
      const headerToken = req.headers['x-csrf-token'];
      const cookieToken = req.cookies['csrf-token'];

      if (!headerToken || headerToken !== cookieToken) {
        throw new ForbiddenException('Invalid CSRF token');
      }
    }

    next();
  }
}
