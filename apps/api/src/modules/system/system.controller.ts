import { Controller, Get, Headers } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';

@Controller('system')
export class SystemController {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  @Get('settings')
  async getSettings(@Headers('x-tenant-id') tenantId: string) {
    // Note: tenantId here is the schemaNamespace or domain-based ID from middleware
    const tenant = await this.tenantRepository.findOne({
      where: [
        { schemaNamespace: tenantId },
        { domain: tenantId }, // Fallback if domain was used
      ],
    });

    if (!tenant) {
      // Return default settings for public/unknown tenants
      return {
        name: 'Nurox ERP',
        primaryColor: '#00b96b',
        logoUrl: '/logo.png',
      };
    }

    return {
      name: tenant.name,
      primaryColor: tenant.primaryColor,
      logoUrl: tenant.logoUrl || '/logo.png',
    };
  }
}
