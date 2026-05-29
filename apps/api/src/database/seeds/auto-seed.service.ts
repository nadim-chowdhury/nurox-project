import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from '../../modules/system/entities/tenant.entity';
import { Role } from '../../modules/auth/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Department } from '../../modules/hr/entities/department.entity';
import {
  Permission,
  RolePermissions,
} from '../../modules/auth/enums/permissions.enum';

@Injectable()
export class AutoSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AutoSeedService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking database seed status...');
    try {
      const tenantRepo = this.dataSource.getRepository(Tenant);
      const tenantCount = await tenantRepo.count();

      if (tenantCount === 0) {
        this.logger.log(
          'No tenants found in the database. Initiating automatic seeding...',
        );
        const defaultTenantId = 'd3b07384-d113-4c4e-9c8e-cf00257e8412';

        await this.dataSource.transaction(
          async (transactionalEntityManager) => {
            // 1. Seed Tenant
            const tenant = tenantRepo.create({
              id: defaultTenantId,
              name: 'Default Tenant',
              schemaNamespace: 'tenant_default',
              domain: 'default.nurox.app',
              isActive: true,
              currency: 'USD',
              timezone: 'UTC',
            });
            await transactionalEntityManager.save(Tenant, tenant);
            this.logger.log(
              `  Seeded Default Tenant: ${tenant.name} (${tenant.id})`,
            );

            // 2. Seed Default System Roles
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
                permissions: [
                  Permission.REPORTS_READ,
                  Permission.SYSTEM_ADMIN_ACCESS,
                ],
              },
            ];

            for (const roleData of defaultRoles) {
              const role = transactionalEntityManager.create(Role, {
                ...roleData,
                tenantId: defaultTenantId,
              });
              await transactionalEntityManager.save(Role, role);
            }
            this.logger.log('  Seeded system roles.');

            // 3. Seed Default Admin User
            const hashedPassword = await bcrypt.hash('password123', 10);
            const adminUser = transactionalEntityManager.create(User, {
              tenantId: defaultTenantId,
              firstName: 'Super',
              lastName: 'Admin',
              email: 'admin@nurox.app',
              passwordHash: hashedPassword,
              role: 'SUPER_ADMIN',
              status: 'ACTIVE',
              isEmailVerified: true,
            });
            await transactionalEntityManager.save(User, adminUser);
            this.logger.log(
              '  Seeded default administrator: admin@nurox.app / password123',
            );

            // 4. Seed Default Departments
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

            for (const deptData of defaultDepts) {
              const dept = transactionalEntityManager.create(Department, {
                ...deptData,
                tenantId: defaultTenantId,
              });
              await transactionalEntityManager.save(Department, dept);
            }
            this.logger.log('  Seeded default departments.');
          },
        );

        this.logger.log('Database auto-seeding completed successfully.');
      } else {
        this.logger.log(
          'Database already contains seed data. Skipping seeding.',
        );
      }
    } catch (error) {
      this.logger.error(
        'Failed to run database seed checking / execution',
        error,
      );
    }
  }
}
