import { Test, TestingModule } from '@nestjs/testing';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../auth/entities/role.entity';

describe('SalesController', () => {
  let controller: SalesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesController],
      providers: [
        {
          provide: SalesService,
          useValue: {
            createLead: jest.fn(),
            findAllLeads: jest.fn(),
            findLeadById: jest.fn(),
            updateLead: jest.fn(),
            removeLead: jest.fn(),
            createDeal: jest.fn(),
            findAllDeals: jest.fn(),
            findDealById: jest.fn(),
            updateDeal: jest.fn(),
            removeDeal: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SalesController>(SalesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
