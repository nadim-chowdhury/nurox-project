import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';
import { StripeService } from '../services/stripe.service';
import { SslcommerzService } from '../services/sslcommerz.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { TenantSubscription } from '../entities/tenant-subscription.entity';
import { Invoice } from '../entities/invoice.entity';
import { getQueueToken } from '@nestjs/bullmq';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';

describe('BillingController', () => {
  let controller: BillingController;

  const mockPlanRepo = {
    find: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockSubscriptionRepo = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockInvoiceRepo = {
    find: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        {
          provide: StripeService,
          useValue: {
            createCheckoutSession: jest.fn(),
            createCustomer: jest.fn(),
          },
        },
        {
          provide: SslcommerzService,
          useValue: { initiatePayment: jest.fn() },
        },
        {
          provide: getRepositoryToken(SubscriptionPlan),
          useValue: mockPlanRepo,
        },
        {
          provide: getRepositoryToken(TenantSubscription),
          useValue: mockSubscriptionRepo,
        },
        { provide: getRepositoryToken(Invoice), useValue: mockInvoiceRepo },
        { provide: getQueueToken('billing'), useValue: mockQueue },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .overrideInterceptor(AuditLogInterceptor)
      .useValue({
        intercept: (_: unknown, next: { handle: () => unknown }) =>
          next.handle(),
      })
      .compile();

    controller = module.get<BillingController>(BillingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return active plans', async () => {
    mockPlanRepo.find.mockResolvedValue([{ id: 'plan-1', name: 'Starter' }]);
    const plans = await controller.getPlans();
    expect(plans).toHaveLength(1);
    expect(mockPlanRepo.find).toHaveBeenCalledWith({
      where: { isActive: true },
    });
  });

  it('should return current subscription', async () => {
    mockSubscriptionRepo.findOne.mockResolvedValue({
      id: 'sub-1',
      tenantId: 'tenant-1',
    });
    const sub = await controller.getCurrentSubscription('tenant-1');
    expect(sub).toBeDefined();
    expect(mockSubscriptionRepo.findOne).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      relations: ['plan'],
    });
  });
});
