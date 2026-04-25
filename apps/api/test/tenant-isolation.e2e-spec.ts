import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Tenant } from '../src/modules/system/entities/tenant.entity';
import { User } from '../src/modules/users/entities/user.entity';
import { Membership } from '../src/modules/auth/entities/membership.entity';
import { Role } from '../src/modules/auth/entities/role.entity';
import { Employee } from '../src/modules/hr/entities/employee.entity';

describe('Tenant Isolation (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should isolate data between tenants using RLS', async () => {
    // 1. Setup two tenants
    const tenantA = await dataSource.getRepository(Tenant).save({
      name: 'Tenant A',
      schemaNamespace: 'tenant_a',
      domain: 'a.nurox.test',
    });

    const tenantB = await dataSource.getRepository(Tenant).save({
      name: 'Tenant B',
      schemaNamespace: 'tenant_b',
      domain: 'b.nurox.test',
    });

    // 2. Setup a global user
    const user = await dataSource.getRepository(User).save({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      passwordHash: 'hashed',
    });

    // 3. Create a shared role
    const role = await dataSource.getRepository(Role).save({
        name: 'ADMIN',
        permissions: [],
    });

    // 4. Give user membership in both tenants
    await dataSource.getRepository(Membership).save([
      { userId: user.id, tenantId: tenantA.id, roleId: role.id },
      { userId: user.id, tenantId: tenantB.id, roleId: role.id },
    ]);

    // 5. Create data in Tenant A
    // Note: In real test, we'd use the API to ensure middleware/subscriber runs
    // But here we simulate what the API does
    await dataSource.createQueryRunner().query(`SET app.current_tenant_id = '${tenantA.id}'`);
    const empA = await dataSource.getRepository(Employee).save({
      firstName: 'Alice',
      lastName: 'A',
      email: 'alice@tenant-a.com',
      employeeId: 'EMP-A',
      joinDate: '2023-01-01',
      tenantId: tenantA.id,
    });

    // 6. Create data in Tenant B
    await dataSource.createQueryRunner().query(`SET app.current_tenant_id = '${tenantB.id}'`);
    const empB = await dataSource.getRepository(Employee).save({
      firstName: 'Bob',
      lastName: 'B',
      email: 'bob@tenant-b.com',
      employeeId: 'EMP-B',
      joinDate: '2023-01-01',
      tenantId: tenantB.id,
    });

    // 7. Verify Isolation via API-like context
    
    // Switch to Tenant A context
    await dataSource.createQueryRunner().query(`SET app.current_tenant_id = '${tenantA.id}'`);
    const employeesInA = await dataSource.getRepository(Employee).find();
    expect(employeesInA.length).toBe(1);
    expect(employeesInA[0].id).toBe(empA.id);

    // Switch to Tenant B context
    await dataSource.createQueryRunner().query(`SET app.current_tenant_id = '${tenantB.id}'`);
    const employeesInB = await dataSource.getRepository(Employee).find();
    expect(employeesInB.length).toBe(1);
    expect(employeesInB[0].id).toBe(empB.id);
  });
});
