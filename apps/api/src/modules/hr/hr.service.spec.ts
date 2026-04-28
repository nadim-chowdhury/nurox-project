import { Test, TestingModule } from '@nestjs/testing';
import { HrService } from './hr.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { PerformanceReview, KeyResult } from './entities/performance.entity';
import { OKRCheckIn } from './entities/okr-checkin.entity';
import { SalaryHistory } from './entities/salary-history.entity';
import { Training } from './entities/training.entity';
import { TrainingCourse } from './entities/training-course.entity';
import { Skill } from './entities/skill.entity';
import { SkillCatalog } from './entities/skill-catalog.entity';
import { ReviewFeedback } from './entities/review-feedback.entity';
import { PIPActionPlan } from './entities/pip-action-plan.entity';
import { ENPSSurvey, ENPSResponse } from './entities/enps.entity';
import { Handbook, HandbookAcknowledgment } from './entities/handbook.entity';
import { SuccessionPlan } from './entities/succession-plan.entity';
import { EmploymentHistory } from './entities/employment-history.entity';
import { SalaryRevision } from './entities/salary-revision.entity';
import { ProbationRecord } from './entities/probation-record.entity';
import { TransferRequest } from './entities/transfer-request.entity';
import { ProfileChangeRequest } from './entities/profile-change-request.entity';
import { Resignation } from './entities/resignation.entity';
import { Termination } from './entities/termination.entity';
import { ExitInterview } from './entities/exit-interview.entity';
import { ClearanceChecklist } from './entities/clearance-checklist.entity';
import { Shift } from './entities/shift.entity';
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
        { provide: getRepositoryToken(KeyResult), useFactory: mockRepository },
        { provide: getRepositoryToken(OKRCheckIn), useFactory: mockRepository },
        {
          provide: getRepositoryToken(SalaryHistory),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Training), useFactory: mockRepository },
        {
          provide: getRepositoryToken(TrainingCourse),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Skill), useFactory: mockRepository },
        {
          provide: getRepositoryToken(SkillCatalog),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ReviewFeedback),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(PIPActionPlan),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(ENPSSurvey), useFactory: mockRepository },
        {
          provide: getRepositoryToken(ENPSResponse),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Handbook), useFactory: mockRepository },
        {
          provide: getRepositoryToken(HandbookAcknowledgment),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SuccessionPlan),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(EmploymentHistory),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SalaryRevision),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ProbationRecord),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(TransferRequest),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ProfileChangeRequest),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Resignation),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Termination),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ExitInterview),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(ClearanceChecklist),
          useFactory: mockRepository,
        },
        { provide: getRepositoryToken(Shift), useFactory: mockRepository },
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
