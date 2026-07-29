import { Test, TestingModule } from '@nestjs/testing';
import { SalesService } from './sales.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Lead } from './entities/lead.entity';
import { Deal } from './entities/deal.entity';
import { Account } from './entities/account.entity';
import { Contact } from './entities/contact.entity';
import { ActivityLog } from './entities/activity-log.entity';
import { Quotation } from './entities/quotation.entity';
import { SalesOrder } from './entities/sales-order.entity';
import { DeliveryOrder } from './entities/delivery-order.entity';
import { Pricelist } from './entities/pricelist.entity';

describe('SalesService', () => {
  let service: SalesService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: getRepositoryToken(Lead), useValue: mockRepo },
        {
          provide: getRepositoryToken(Deal),
          useValue: {
            ...mockRepo,
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawOne: jest.fn(),
              getRawMany: jest.fn(),
            })),
          },
        },
        { provide: getRepositoryToken(Account), useValue: mockRepo },
        { provide: getRepositoryToken(Contact), useValue: mockRepo },
        { provide: getRepositoryToken(ActivityLog), useValue: mockRepo },
        { provide: getRepositoryToken(Quotation), useValue: mockRepo },
        { provide: getRepositoryToken(SalesOrder), useValue: mockRepo },
        { provide: getRepositoryToken(DeliveryOrder), useValue: mockRepo },
        { provide: getRepositoryToken(Pricelist), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<SalesService>(SalesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
