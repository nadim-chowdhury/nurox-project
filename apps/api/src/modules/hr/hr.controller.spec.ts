import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HrController } from './hr.controller';
import { HrService } from './hr.service';
import { AttendanceService } from '../attendance/attendance.service';
import { Role } from '../auth/entities/role.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('HrController', () => {
  let controller: HrController;

  const mockHrService = {
    createEmployee: jest.fn(),
    findAllEmployees: jest.fn(),
    findEmployeeById: jest.fn(),
    updateEmployee: jest.fn(),
    removeEmployee: jest.fn(),
    transferEmployee: jest.fn(),
    terminateEmployee: jest.fn(),
    updateSalary: jest.fn(),
    addOKR: jest.fn(),
    submit360Review: jest.fn(),
    initiatePIP: jest.fn(),
    addTraining: jest.fn(),
    findAllTrainings: jest.fn(),
    addSkill: jest.fn(),
    getSkillMatrix: jest.fn(),
    getEmployeeHistory: jest.fn(),
    getSalaryHistory: jest.fn(),
    getTrainingCertificate: jest.fn(),
    createDepartment: jest.fn(),
    findAllDepartments: jest.fn(),
    findDepartmentById: jest.fn(),
    updateDepartment: jest.fn(),
    removeDepartment: jest.fn(),
    createDesignation: jest.fn(),
    findAllDesignations: jest.fn(),
    findDesignationById: jest.fn(),
    updateDesignation: jest.fn(),
    removeDesignation: jest.fn(),
    getCount: jest.fn(),
  };

  const mockAttendanceService = {
    markAttendance: jest.fn(),
    getAttendanceByEmployee: jest.fn(),
    getAttendanceStats: jest.fn(),
    bulkImport: jest.fn(),
    getShiftSchedule: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrController],
      providers: [
        {
          provide: HrService,
          useValue: mockHrService,
        },
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<HrController>(HrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
