import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Department } from '../../modules/hr/entities/department.entity';
import { Role } from '../../modules/auth/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Tenant } from '../../modules/system/entities/tenant.entity';
import * as bcrypt from 'bcrypt';
import {
  Permission,
  RolePermissions,
} from '../../modules/auth/enums/permissions.enum';

/**
 * Seed service for initial tenant data provisioning.
 *
 * IMPORTANT: All seed methods require a `tenantId` parameter.
 * This enforces multi-tenant isolation — no data is ever created
 * without being scoped to a specific tenant.
 *
 * Called during:
 * 1. Tenant signup (provision workflow)
 * 2. Development setup (CLI: `pnpm --filter api seed -- <tenant-uuid>`)
 */
@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Run all seeders for a given tenant.
   * Follows the tenant provisioning workflow from the architecture doc:
   * 1. Seed default roles
   * 2. Seed default departments
   * 3. (Future: leave types, chart of accounts, fiscal year, etc.)
   */
  async seedAll(tenantId: string) {
    this.logger.log(`Starting seed for tenant: ${tenantId}`);

    await this.dataSource.transaction(async () => {
      await this.seedTenant(tenantId);
      await this.seedRoles(tenantId);
      await this.seedAdminUser(tenantId);
      await this.seedDepartments(tenantId);
      // Future seeders — uncomment as modules are completed:
      // await this.seedLeaveTypes(tenantId);
      // await this.seedChartOfAccounts(tenantId);
      // await this.seedPayrollStructures(tenantId);
    });

    this.logger.log(`Seeding completed for tenant: ${tenantId}`);
  }

  /**
   * Seed the tenant itself if it doesn't exist.
   */
  private async seedTenant(tenantId: string) {
    const exists = await this.tenantRepo.findOneBy({ id: tenantId });
    if (!exists) {
      const tenant = this.tenantRepo.create({
        id: tenantId,
        name: 'Default Tenant',
        schemaNamespace: 'tenant_default',
        domain: 'default.nurox.app',
        isActive: true,
      });
      await this.tenantRepo.save(tenant);
      this.logger.log(`  Created Tenant: ${tenant.name} (${tenant.id})`);
    } else {
      this.logger.debug(`  Tenant ${tenantId} already exists, skipping.`);
    }
  }

  /**
   * Seed default system roles per architecture doc Section 7.2.
   * Role entity uses `name` as identifier (not `key`).
   * System roles: Super Admin, Admin, HR Manager, Finance Manager, Manager, Employee, Viewer, Auditor
   */
  private async seedRoles(tenantId: string) {
    const defaultRoles: Array<{
      name: string;
      description: string;
      isSystem: boolean;
      permissions: Permission[];
    }> = [
      {
        name: 'Super Admin',
        description: 'Full system access — tenant owner',
        isSystem: true,
        permissions: Object.values(Permission),
      },
      {
        name: 'Admin',
        description: 'Administrative access to all modules',
        isSystem: true,
        permissions: RolePermissions.ADMIN || Object.values(Permission),
      },
      {
        name: 'HR Manager',
        description: 'Full HR, Attendance, Leave, Recruitment access',
        isSystem: true,
        permissions: RolePermissions.HR_MANAGER || [],
      },
      {
        name: 'Finance Manager',
        description: 'Full Finance, Payroll, Billing access',
        isSystem: true,
        permissions: RolePermissions.ACCOUNTANT || [],
      },
      {
        name: 'Manager',
        description: 'Team management, approvals',
        isSystem: true,
        permissions: RolePermissions.PROJECT_MANAGER || [],
      },
      {
        name: 'Employee',
        description: 'Self-service access',
        isSystem: true,
        permissions: RolePermissions.EMPLOYEE || [],
      },
      {
        name: 'Viewer',
        description: 'Read-only access',
        isSystem: true,
        permissions: RolePermissions.EMPLOYEE || [],
      },
      {
        name: 'Auditor',
        description: 'Audit logs and compliance read access',
        isSystem: true,
        permissions: [Permission.REPORTS_READ, Permission.SYSTEM_ADMIN_ACCESS],
      },
    ];

    for (const data of defaultRoles) {
      const exists = await this.roleRepo.findOneBy({
        tenantId,
        name: data.name,
      });
      if (!exists) {
        const role = this.roleRepo.create({ ...data, tenantId });
        await this.roleRepo.save(role);
        this.logger.log(`  Created Role: ${role.name}`);
      } else {
        this.logger.debug(`  Role ${data.name} already exists, skipping.`);
      }
    }
  }

  /**
   * Seed default departments for a new tenant.
   */
  private async seedDepartments(tenantId: string) {
    const defaultDepts = [
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Core HR and Employee management',
      },
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Software Development and IT',
      },
      {
        name: 'Finance',
        code: 'FIN',
        description: 'Accounting and Financial Planning',
      },
      {
        name: 'Sales',
        code: 'SAL',
        description: 'Global Sales and Partnerships',
      },
      {
        name: 'Operations',
        code: 'OPS',
        description: 'Business Operations and Logistics',
      },
    ];

    for (const data of defaultDepts) {
      const exists = await this.departmentRepo.findOneBy({
        tenantId,
        code: data.code,
      });
      if (!exists) {
        const dept = this.departmentRepo.create({ ...data, tenantId });
        await this.departmentRepo.save(dept);
        this.logger.log(`  Created Department: ${dept.name} (${dept.code})`);
      } else {
        this.logger.debug(
          `  Department ${data.code} already exists, skipping.`,
        );
      }
    }
  }

  /**
   * Seed a default Super Admin user for the tenant.
   */
  private async seedAdminUser(tenantId: string) {
    const adminEmail = 'admin@nurox.app';
    const exists = await this.userRepo.findOneBy({
      tenantId,
      email: adminEmail,
    });

    if (!exists) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = this.userRepo.create({
        tenantId,
        firstName: 'Super',
        lastName: 'Admin',
        email: adminEmail,
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isEmailVerified: true,
      });
      await this.userRepo.save(user);
      this.logger.log(`  Created Admin User: ${adminEmail} (password123)`);
    } else {
      this.logger.debug(`  Admin user ${adminEmail} already exists, skipping.`);
    }
  }
}
