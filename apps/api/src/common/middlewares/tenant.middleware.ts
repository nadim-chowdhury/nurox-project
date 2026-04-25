import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { Tenant } from '../../modules/system/entities/tenant.entity';
import { TenantCustomDomain } from '../../modules/system/entities/tenant-custom-domain.entity';

export const TENANT_HEADER = 'x-tenant-id';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // 1. Extract from Header or Hostname
    let tenantIdentifier = req.headers[TENANT_HEADER] as string;

    if (!tenantIdentifier) {
      const host = req.headers.host || '';
      // acme.nurox.app -> acme
      const parts = host.split('.');
      if (parts.length >= 3) {
        tenantIdentifier = parts[0];
      } else {
        // Might be a custom domain like erp.acme.com
        tenantIdentifier = host;
      }
    }

    if (!tenantIdentifier || tenantIdentifier === 'public') {
        // Some routes might be truly public/system-wide
        req['tenantId'] = null;
        return next();
    }

    // 2. Resolve UUID if it's a slug
    // We'll use a simple query for now. In production, this should be cached (Redis/In-memory).
    let tenant: Tenant | null = null;
    
    // Check if it's already a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tenantIdentifier);

    if (isUuid) {
        tenant = await this.dataSource.getRepository(Tenant).findOneBy({ id: tenantIdentifier });
    } else {
        // Try slug first
        tenant = await this.dataSource.getRepository(Tenant).findOneBy({ schemaNamespace: tenantIdentifier });
        
        // If not found, try custom domain
        if (!tenant) {
          const customDomain = await this.dataSource.getRepository(TenantCustomDomain).findOne({
            where: { hostname: tenantIdentifier, isVerified: true },
            relations: ['tenant'],
          });
          if (customDomain) {
            tenant = customDomain.tenant;
          }
        }
    }

    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantIdentifier}" not found.`);
    }

    if (!tenant.isActive) {
      throw new BadRequestException(`Tenant "${tenant.name}" is inactive.`);
    }

    // IP Allowlist Check
    if (tenant.ipAllowlist && tenant.ipAllowlist.length > 0) {
      const clientIp = req.ip || req.socket.remoteAddress;
      if (clientIp && !tenant.ipAllowlist.includes(clientIp)) {
        throw new ForbiddenException(`Access denied from IP ${clientIp}. This tenant has IP white-listing enabled.`);
      }
    }

    // Attach to standard express request namespace
    req['tenantId'] = tenant.id;
    req['tenant'] = tenant;

    next();
  }
}
