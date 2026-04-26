import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantModule } from './entities/tenant-module.entity';
import { TenantCustomDomain } from './entities/tenant-custom-domain.entity';
import { Role } from '../auth/entities/role.entity';
import { Permission, RolePermissions } from '../auth/enums/permissions.enum';
import * as dns from 'dns';
import { promisify } from 'util';

const resolveTxt = promisify(dns.resolveTxt);

@Injectable()
export class TenantProvisioningService {
  private readonly logger = new Logger(TenantProvisioningService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Provisions a new tenant:
   * 1. Creates the Tenant record in public schema.
   * 2. Creates the Postgres Schema.
   * 3. Initializes default modules.
   * 4. Seeds default roles with permissions.
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
      await manager.query(
        `CREATE SCHEMA IF NOT EXISTS "${data.schemaNamespace}"`,
      );

      // 4. Initialize Modules
      const defaultModules = data.modules || ['hr', 'system'];
      for (const moduleKey of defaultModules) {
        const tModule = manager.create(TenantModule, {
          tenantId: savedTenant.id,
          moduleKey,
          isEnabled: true,
        });
        await manager.save(tModule);
      }

      // 5. Seed default roles with permissions
      await this.seedDefaultRoles(manager, savedTenant.id);

      // 6. Seed default tenant data (COA, Leave Types, Fiscal Year)
      await this.seedDefaultTenantData(manager, savedTenant.id);

      this.logger.log(
        `Tenant ${data.name} provisioned successfully with schema ${data.schemaNamespace}`,
      );

      return savedTenant;
    });
  }

  /**
   * Seeds default tenant data like Chart of Accounts and Accounting Periods.
   */
  private async seedDefaultTenantData(
    manager: EntityManager,
    tenantId: string,
  ): Promise<void> {
    // 1. Seed Chart of Accounts
    const defaultAccounts = [
      { code: '1000', name: 'Cash', type: 'ASSET' },
      { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
      { code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
      { code: '3000', name: 'Retained Earnings', type: 'EQUITY' },
      { code: '4000', name: 'Sales Revenue', type: 'REVENUE' },
      { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE' },
      { code: '6000', name: 'Operating Expenses', type: 'EXPENSE' },
    ];

    for (const accData of defaultAccounts) {
      await manager.query(
        `INSERT INTO chart_of_accounts (id, tenant_id, code, name, type, currency, balance, is_active, created_at, updated_at)
         VALUES (gen_random_uuid(), '${tenantId}', '${accData.code}', '${accData.name}', '${accData.type}', 'USD', 0, true, now(), now())`,
      );
    }

    // 2. Seed default Accounting Periods for the current year
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1);
      const endDate = new Date(currentYear, month + 1, 0);
      const name = startDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });

      await manager.query(
        `INSERT INTO accounting_periods (id, tenant_id, name, start_date, end_date, status, is_year_end, created_at, updated_at)
         VALUES (gen_random_uuid(), '${tenantId}', '${name}', '${startDate.toISOString().split('T')[0]}', '${endDate.toISOString().split('T')[0]}', 'OPEN', false, now(), now())`,
      );
    }

    this.logger.log(`Seeded default data for tenant ${tenantId}`);
  }

  /**
   * Seeds the default system roles for a new tenant.
   * Roles: SUPER_ADMIN, ADMIN, HR_MANAGER, FINANCE_MANAGER, MANAGER, EMPLOYEE, VIEWER
   */
  private async seedDefaultRoles(
    manager: EntityManager,
    tenantId: string,
  ): Promise<void> {
    const systemRoles = [
      {
        name: 'SUPER_ADMIN',
        description: 'Full system access — tenant owner',
        permissions: Object.values(Permission),
        isSystem: true,
      },
      {
        name: 'ADMIN',
        description: 'Administrative access to all modules',
        permissions: RolePermissions['ADMIN'] || Object.values(Permission),
        isSystem: true,
      },
      {
        name: 'HR_MANAGER',
        description: 'Full HR, attendance, leave, and recruitment access',
        permissions: RolePermissions['HR_MANAGER'] || [],
        isSystem: true,
      },
      {
        name: 'FINANCE_MANAGER',
        description: 'Full finance, payroll, and billing access',
        permissions: RolePermissions['ACCOUNTANT'] || [],
        isSystem: true,
      },
      {
        name: 'MANAGER',
        description: 'Team management, approvals, and reporting',
        permissions: RolePermissions['PROJECT_MANAGER'] || [],
        isSystem: true,
      },
      {
        name: 'EMPLOYEE',
        description: 'Self-service access — profile, leave, payslips',
        permissions: RolePermissions['EMPLOYEE'] || [],
        isSystem: true,
      },
      {
        name: 'VIEWER',
        description: 'Read-only access to assigned modules',
        permissions: [
          Permission.HR_VIEW_EMPLOYEES,
          Permission.HR_VIEW_DEPARTMENTS,
        ],
        isSystem: true,
      },
    ];

    for (const roleData of systemRoles) {
      const role = manager.create(Role, roleData);
      await manager.save(role);
    }

    this.logger.log(
      `Seeded ${systemRoles.length} default roles for tenant ${tenantId}`,
    );
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

  /**
   * Verifies a custom domain by checking for a specific DNS TXT record.
   * Format: nurox-verification=[verificationToken]
   */
  async verifyCustomDomain(domainId: string): Promise<boolean> {
    const domain = await this.dataSource
      .getRepository(TenantCustomDomain)
      .findOne({ where: { id: domainId } });

    if (!domain) {
      throw new NotFoundException('Custom domain record not found');
    }

    try {
      const records = await resolveTxt(domain.hostname);
      const verificationString = `nurox-verification=${domain.verificationToken}`;

      const isVerified = records.some((record) =>
        record.some((val) => val.includes(verificationString)),
      );

      if (isVerified) {
        await this.dataSource
          .getRepository(TenantCustomDomain)
          .update(domainId, { isVerified: true, verifiedAt: new Date() });
        this.logger.log(
          `Custom domain ${domain.hostname} verified successfully.`,
        );
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        `DNS lookup failed for ${domain.hostname}: ${error.message}`,
      );
      return false;
    }
  }
}
