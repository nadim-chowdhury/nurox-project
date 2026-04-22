import { Test, TestingModule } from '@nestjs/testing';
import { HrService } from './hr.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { PerformanceReview } from './entities/performance.entity';
import { SalaryHistory } from './entities/salary-history.entity';
import { Training } from './entities/training.entity';
import { Skill } from './entities/skill.entity';
import { EmploymentHistory } from './entities/employment-history.entity';
import { PdfService } from '../system/pdf.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('HrService', () => {
  let service: HrService;

  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    softDelete: jest.fn(),
    findAndCount: jest.fn(),
    findTrees: jest.fn(),
    manager: {
      transaction: jest.fn((cb) =>
        cb({
          create: jest.fn((entity, data) => data),
          save: jest.fn((data) => data),
          update: jest.fn(),
        }),
      ),
    },
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HrService,
        { provide: getRepositoryToken(Employee), useFactory: mockRepository },
        { provide: getRepositoryToken(Department), useFactory: mockRepository },
        {
          provide: getRepositoryToken(Designation),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(PerformanceReview),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SalaryHistory),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Training), useFactory: mockRepository },
        { provide: getRepositoryToken(Skill), useFactory: mockRepository },
        {
          provide: getRepositoryToken(EmploymentHistory),
          useFactory: mockRepository,
        },
        {
          provide: PdfService,
          useValue: {
            generatePdf: jest.fn(),
          },
        },
        {
          provide: getQueueToken('hr'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HrService>(HrService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
