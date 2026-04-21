import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantModule } from './entities/tenant-module.entity';

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Provisions a new tenant:
   * 1. Creates the Tenant record in public schema.
   * 2. Creates the Postgres Schema.
   * 3. Initializes default modules.
   * 4. (Optional) Runs seeds for the new tenant.
   */
  async provisionTenant(data: {
    name: string;
    schemaNamespace: string;
    domain: string;
    modules?: string[];
  }): Promise<Tenant> {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Check if tenant already exists
      const existing = await manager.findOne(Tenant, {
        where: [
          { schemaNamespace: data.schemaNamespace },
          { domain: data.domain },
        ],
      });

      if (existing) {
        throw new ConflictException(
          'Tenant with this schema or domain already exists',
        );
      }

      // 2. Create Tenant record
      const tenant = manager.create(Tenant, {
        name: data.name,
        schemaNamespace: data.schemaNamespace,
        domain: data.domain,
        isActive: true,
      });
      const savedTenant = await manager.save(tenant);

      // 3. Create the Postgres Schema
      // Note: We use raw query because TypeORM doesn't have a high-level "create schema" that is cross-DB
      await manager.query(
        `CREATE SCHEMA IF NOT EXISTS "${data.schemaNamespace}"`,
      );

      // 4. Initialize Modules
      const defaultModules = data.modules || ['hr', 'system']; // default modules
      for (const moduleKey of defaultModules) {
        const tModule = manager.create(TenantModule, {
          tenantId: savedTenant.id,
          moduleKey,
          isEnabled: true,
        });
        await manager.save(tModule);
      }

      this.logger.log(
        `Tenant ${data.name} provisioned successfully with schema ${data.schemaNamespace}`,
      );

      // 5. In a real-world scenario, you'd trigger migrations for the new schema here.
      // For this implementation, we assume the tables are created either via synchronize (dev)
      // or a migration runner that iterates over schemas.

      return savedTenant;
    });
  }

  /**
   * Enables or disables a module for a tenant.
   */
  async toggleModule(tenantId: string, moduleKey: string, isEnabled: boolean) {
    await this.dataSource.manager.update(
      TenantModule,
      { tenantId, moduleKey },
      { isEnabled },
    );
  }
}
