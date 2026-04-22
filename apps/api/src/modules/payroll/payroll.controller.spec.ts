import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../auth/entities/role.entity';

describe('PayrollController', () => {
  let controller: PayrollController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        {
          provide: PayrollService,
          useValue: {
            createStructure: jest.fn(),
            findAllStructures: jest.fn(),
            assignStructure: jest.fn(),
            findAllTaxConfigs: jest.fn(),
            createTaxConfig: jest.fn(),
            createRun: jest.fn(),
            processRun: jest.fn(),
            approveRun: jest.fn(),
            finalizeRun: jest.fn(),
            publishPayslips: jest.fn(),
            generateBeftnExport: jest.fn(),
            getPayslipsByEmployee: jest.fn(),
            getPayslipsByRun: jest.fn(),
            getPayslipDownloadUrl: jest.fn(),
            getPayslipPdf: jest.fn(),
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

    controller = module.get<PayrollController>(PayrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
