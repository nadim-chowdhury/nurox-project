import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export const TENANT_HEADER = 'x-tenant-id';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Extract from Header (set by Edge Router / Next.js)
    const tenantId = req.headers[TENANT_HEADER];

    // Alternatively, extract from custom subdomain if header is missing
    // const host = req.headers.host;
    // const subdomain = host.split('.')[0];

    // We expect the edge/client to pass the explicit string or subdomain mapping
    if (!tenantId) {
      throw new BadRequestException(
        'Missing x-tenant-id header. Requests must execute within a Tenant context.',
      );
    }

    // Attach to standard express request namespace
    req['tenantId'] = tenantId as string;

    next();
  }
}
