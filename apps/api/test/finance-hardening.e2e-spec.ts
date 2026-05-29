jest.mock('archiver', () => {
  return () => ({
    pipe: jest.fn(),
    append: jest.fn(),
    finalize: jest.fn(),
    on: jest.fn(),
  });
});

jest.mock('meilisearch', () => {
  const mockClient = jest.fn().mockImplementation(() => ({
    index: jest.fn().mockReturnThis(),
    addDocuments: jest.fn(),
    search: jest.fn(),
  }));
  return {
    MeiliSearch: mockClient,
    Meilisearch: mockClient,
  };
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { Tenant } from '../src/modules/system/entities/tenant.entity';
import {
  Account,
  AccountType,
} from '../src/modules/finance/entities/account.entity';
import { ClsService } from 'nestjs-cls';
import { getQueueToken } from '@nestjs/bullmq';

describe('Finance Hardening (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let cls: ClsService;

  const mockQueue = {
    add: jest.fn(),
    process: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getQueueToken('ar_reminders'))
      .useValue(mockQueue)
      .overrideProvider(getQueueToken('hr'))
      .useValue(mockQueue)
      // Add other queues as needed if they cause issues
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
    cls = app.get(ClsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should allow multiple tenants to have the same account code', async () => {
    const tenantRepo = dataSource.getRepository(Tenant);
    const accountRepo = dataSource.getRepository(Account);

    // 1. Create two tenants
    const tenantA = await tenantRepo.save({
      name: 'Hardening Tenant A',
      subdomain: 'hardening-a',
    });

    const tenantB = await tenantRepo.save({
      name: 'Hardening Tenant B',
      subdomain: 'hardening-b',
    });

    // 2. Create account '1010' for Tenant A
    await accountRepo.save({
      tenantId: tenantA.id,
      code: '1010',
      name: 'Cash A',
      type: AccountType.ASSET,
    });

    // 3. Create account '1010' for Tenant B
    // This should succeed because of the composite unique index
    const accountB = await accountRepo.save({
      tenantId: tenantB.id,
      code: '1010',
      name: 'Cash B',
      type: AccountType.ASSET,
    });

    expect(accountB.id).toBeDefined();

    // 4. Verify uniqueness is still enforced PER tenant
    await expect(
      accountRepo.save({
        tenantId: tenantB.id,
        code: '1010',
        name: 'Duplicate Cash B',
        type: AccountType.ASSET,
      }),
    ).rejects.toThrow();
  });

  it('should isolate account queries by tenantId', async () => {
    const tenantRepo = dataSource.getRepository(Tenant);
    const accountRepo = dataSource.getRepository(Account);

    // Setup fresh tenants
    const tenantX = await tenantRepo.save({
      name: 'Tenant X',
      subdomain: 'tx',
    });
    const tenantY = await tenantRepo.save({
      name: 'Tenant Y',
      subdomain: 'ty',
    });

    await accountRepo.save([
      {
        tenantId: tenantX.id,
        code: 'X1',
        name: 'Acc X',
        type: AccountType.ASSET,
      },
      {
        tenantId: tenantY.id,
        code: 'Y1',
        name: 'Acc Y',
        type: AccountType.ASSET,
      },
    ]);

    // Test FinanceService manually scoping (since we can't easily trigger the whole request stack here)
    // Actually, we can use the app to get the service
    const { FinanceService } =
      await import('../src/modules/finance/finance.service');
    const financeService = app.get(FinanceService);

    // Mock CLS context for Tenant X
    await cls.run(async () => {
      cls.set('tenantId', tenantX.id);
      const accountsX = await financeService.findAllAccounts();
      expect(accountsX.length).toBe(1);
      expect(accountsX[0].code).toBe('X1');
    });

    // Mock CLS context for Tenant Y
    await cls.run(async () => {
      cls.set('tenantId', tenantY.id);
      const accountsY = await financeService.findAllAccounts();
      expect(accountsY.length).toBe(1);
      expect(accountsY[0].code).toBe('Y1');
    });
  });
});
