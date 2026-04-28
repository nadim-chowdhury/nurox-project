import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PayrollRun, Payslip } from './entities/payroll.entity';
import {
  SalaryStructure,
  EmployeeSalaryAssignment,
} from './entities/salary-structure.entity';
import { TaxConfiguration } from './entities/tax-bracket.entity';
import { EmployeeLoan, LoanRepayment } from './entities/loan.entity';
import { AdvanceSalaryRequest } from './entities/advance-salary.entity';
import { EmployeeBonus } from './entities/bonus.entity';
import { PayrollAudit } from './entities/payroll-audit.entity';
import { SalaryHistory } from '../hr/entities/salary-history.entity';
import { AttendanceRecord } from '../attendance/entities/attendance.entity';
import { Employee } from '../hr/entities/employee.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { LeaveService } from '../leave/leave.service';
import { PayrollComputeService } from './payroll-compute.service';
import { PdfService } from '../system/pdf.service';
import { StorageService } from '../system/storage.service';
import { AuditService } from '../system/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { getQueueToken } from '@nestjs/bullmq';
import { ClsService } from 'nestjs-cls';

describe('PayrollService', () => {
  let service: PayrollService;

  const mockRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    manager: {
      transaction: jest.fn((cb) =>
        cb({
          create: jest.fn((entity, data) => data),
          save: jest.fn((data) => data),
          update: jest.fn(),
          find: jest.fn(),
        }),
      ),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: getRepositoryToken(PayrollRun),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Payslip),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SalaryStructure),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(SalaryHistory),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(EmployeeSalaryAssignment),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(TaxConfiguration),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(EmployeeLoan),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(LoanRepayment),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(AdvanceSalaryRequest),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(EmployeeBonus),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(AttendanceRecord),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(PayrollAudit),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(Employee),
          useFactory: mockRepository,
        },
        {
          provide: AttendanceService,
          useValue: {
            getTeamAttendance: jest.fn(),
          },
        },
        {
          provide: LeaveService,
          useValue: {
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
        {
          provide: getQueueToken('payroll'),
          useValue: {
            add: jest.fn(),
          },
        },
        {
          provide: ClsService,
          useValue: {
            get: jest.fn(),
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
