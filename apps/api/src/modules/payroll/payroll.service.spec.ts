import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PayrollRun, Payslip } from './entities/payroll.entity';
import {
  SalaryStructure,
  EmployeeSalaryAssignment,
} from './entities/salary-structure.entity';
import { TaxConfiguration } from './entities/tax-bracket.entity';
import { SalaryHistory } from '../hr/entities/salary-history.entity';
import { Employee } from '../hr/entities/employee.entity';
import { AttendanceService } from '../hr/attendance.service';
import { PayrollComputeService } from './payroll-compute.service';
import { PdfService } from '../system/pdf.service';
import { StorageService } from '../system/storage.service';
import { AuditService } from '../system/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('PayrollService', () => {
  let service: PayrollService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: getRepositoryToken(PayrollRun),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(Payslip),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SalaryStructure),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SalaryHistory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EmployeeSalaryAssignment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TaxConfiguration),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Employee),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: AttendanceService,
          useValue: {
            getTeamAttendance: jest.fn(),
            getEncashableLeaveDays: jest.fn(),
          },
        },
        {
          provide: PayrollComputeService,
          useValue: {
            calculatePayslipItems: jest.fn(),
          },
        },
        {
          provide: PdfService,
          useValue: {
            generatePdf: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            getDownloadPresignedUrl: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
