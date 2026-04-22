import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, EntityManager } from 'typeorm';
import { Employee, EmployeeStatus, Gender } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import {
  PerformanceReview,
  PerformanceReviewStatus,
  KeyResult,
  PerformanceReviewType,
} from './entities/performance.entity';
import {
  SalaryHistory,
  SalaryChangeReason,
} from './entities/salary-history.entity';
import { Training, TrainingStatus } from './entities/training.entity';
import { Skill } from './entities/skill.entity';
import {
  EmploymentHistory,
  EmploymentEvent,
} from './entities/employment-history.entity';
import { PdfService } from '../system/pdf.service';
import {
  CreateEmployeeDto,
  EmployeeResponseDto,
  OkrDto,
  TrainingDto,
  SkillDto,
  TransferEmployeeDto,
  TerminationDto,
  PipDto,
  ThreeSixtyReviewDto,
} from '@repo/shared-schemas';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepo: TreeRepository<Department>,
    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,
    @InjectRepository(PerformanceReview)
    private readonly performanceRepo: Repository<PerformanceReview>,
    @InjectRepository(SalaryHistory)
    private readonly salaryHistoryRepo: Repository<SalaryHistory>,
    @InjectRepository(Training)
    private readonly trainingRepo: Repository<Training>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(EmploymentHistory)
    private readonly employmentHistoryRepo: Repository<EmploymentHistory>,
    private readonly pdfService: PdfService,
    @InjectQueue('hr')
    private readonly hrQueue: Queue,
  ) {}

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    return await this.employeeRepo.manager.transaction(async (manager) => {
      const { baseSalary, ...rest } = dto;
      const employee = manager.create(Employee, {
        ...(rest as any),
        salary: baseSalary,
        gender: dto.gender as Gender,
        employeeId:
          dto.employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
        status: EmployeeStatus.ACTIVE,
      });

      const saved = await manager.save(employee);

      const history = manager.create(EmploymentHistory, {
        employeeId: saved.id,
        event: EmploymentEvent.HIRED,
        effectiveDate: saved.joinDate,
        comments: 'Initial onboarding',
      });
      await manager.save(history);

      const salaryHistory = manager.create(SalaryHistory, {
        employeeId: saved.id,
        previousSalary: 0,
        newSalary: saved.salary,
        effectiveDate: saved.joinDate,
        reason: SalaryChangeReason.INITIAL_OFFER,
        comments: 'Starting salary',
      });
      await manager.save(salaryHistory);

      if (saved.probationEndDate) {
        const delay = new Date(saved.probationEndDate).getTime() - Date.now();
        if (delay > 0) {
          await this.hrQueue.add(
            'probation-expiry-check',
            { employeeId: saved.id },
            { delay },
          );
        }
      }

      if (saved.contractExpiryDate) {
        const delay = new Date(saved.contractExpiryDate).getTime() - Date.now();
        if (delay > 0) {
          await this.hrQueue.add(
            'contract-expiry-check',
            { employeeId: saved.id },
            { delay },
          );
        }
      }

      this.logger.log(`Employee created: ${saved.employeeId}`);
      return saved;
    });
  }

  async findAllEmployees(query: QueryEmployeeDto) {
    const { page = 1, limit = 25, search, departmentId, status } = query;
    const qb = this.employeeRepo
      .createQueryBuilder('employee')
      .leftJoinAndSelect('employee.department', 'department')
      .leftJoinAndSelect('employee.designation', 'designation')
      .where('employee.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(employee.firstName ILIKE :s OR employee.lastName ILIKE :s OR employee.email ILIKE :s OR employee.employeeId ILIKE :s)',
        { s: `%${search}%` },
      );
    }
    if (departmentId) {
      qb.andWhere('employee.departmentId = :deptId', { departmentId });
    }
    if (status) {
      qb.andWhere('employee.status = :status', { status });
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('employee.createdAt', 'DESC')
      .getManyAndCount();

    return { data, meta: { total, page, limit } };
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['department', 'designation', 'manager', 'shift'],
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async updateEmployee(id: string, dto: any): Promise<Employee> {
    await this.findEmployeeById(id);
    await this.employeeRepo.update(id, dto);
    return this.findEmployeeById(id);
  }

  async removeEmployee(id: string): Promise<void> {
    await this.findEmployeeById(id);
    await this.employeeRepo.softDelete(id);
  }

  async transferEmployee(id: string, dto: TransferEmployeeDto) {
    const employee = await this.findEmployeeById(id);
    return await this.employeeRepo.manager.transaction(async (manager) => {
      const history = manager.create(EmploymentHistory, {
        employeeId: id,
        event: EmploymentEvent.TRANSFERRED,
        oldDepartmentId: employee.departmentId,
        newDepartmentId: dto.departmentId,
        oldDesignationId: employee.designationId,
        newDesignationId: dto.designationId,
        effectiveDate: dto.effectiveDate,
        comments: dto.comments,
      });
      await manager.save(history);

      await manager.update(Employee, id, {
        departmentId: dto.departmentId,
        designationId: dto.designationId,
      });

      return this.findEmployeeById(id);
    });
  }

  async terminateEmployee(id: string, dto: TerminationDto) {
    await this.findEmployeeById(id);
    return await this.employeeRepo.manager.transaction(async (manager) => {
      const history = manager.create(EmploymentHistory, {
        employeeId: id,
        event: EmploymentEvent.TERMINATED,
        effectiveDate: dto.endDate,
        comments: `${dto.reason}: ${dto.comments}`,
      });
      await manager.save(history);

      await manager.update(Employee, id, {
        status: EmployeeStatus.TERMINATED,
        endDate: dto.endDate,
      });

      return { success: true };
    });
  }

  async updateSalary(
    id: string,
    newSalary: number,
    reason: SalaryChangeReason,
    comments?: string,
  ) {
    const employee = await this.findEmployeeById(id);
    return await this.employeeRepo.manager.transaction(async (manager) => {
      const history = manager.create(SalaryHistory, {
        employeeId: id,
        previousSalary: employee.salary,
        newSalary,
        effectiveDate: new Date().toISOString(), // Default to now
        reason,
        comments,
      });
      await manager.save(history);

      await manager.update(Employee, id, { salary: newSalary });

      // Also log a promotion if reason is promotion
      if (reason === SalaryChangeReason.PROMOTION) {
        const empHistory = manager.create(EmploymentHistory, {
          employeeId: id,
          event: EmploymentEvent.PROMOTED,
          effectiveDate: new Date().toISOString(),
          comments: 'Salary promotion update',
        });
        await manager.save(empHistory);
      }

      return { success: true };
    });
  }

  async addOKR(id: string, dto: OkrDto) {
    const review = this.performanceRepo.create({
      employeeId: id,
      type: PerformanceReviewType.OKR,
      objective: dto.objective,
      period: dto.period,
      status: PerformanceReviewStatus.DRAFT,
      keyResults: dto.keyResults as any[],
    });
    return this.performanceRepo.save(review);
  }

  async submit360Review(id: string, dto: ThreeSixtyReviewDto) {
    const review = this.performanceRepo.create({
      employeeId: id,
      type: PerformanceReviewType.THREE_SIXTY,
      objective: dto.objective,
      period: dto.period,
      selfRating: dto.selfRating,
      status: PerformanceReviewStatus.ACTIVE,
    });
    return this.performanceRepo.save(review);
  }

  async initiatePIP(id: string, dto: PipDto) {
    const review = this.performanceRepo.create({
      employeeId: id,
      type: PerformanceReviewType.PIP,
      objective: dto.objective,
      period: dto.period,
      status: PerformanceReviewStatus.ACTIVE,
      documentationUrl: dto.documentationUrl,
    });
    return this.performanceRepo.save(review);
  }

  async addTraining(id: string, dto: TrainingDto) {
    const training = this.trainingRepo.create({
      employeeId: id,
      ...dto,
      status: TrainingStatus.ENROLLED,
    });
    return this.trainingRepo.save(training);
  }

  async findAllTrainings() {
    return this.trainingRepo.find({
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async addSkill(id: string, dto: SkillDto) {
    const skill = this.skillRepo.create({
      employeeId: id,
      ...dto,
    });
    return this.skillRepo.save(skill);
  }

  async getSkillMatrix() {
    const skills = await this.skillRepo.find({ relations: ['employee'] });
    // Group by skill name
    const matrix = {};
    skills.forEach((s) => {
      if (!matrix[s.skillName]) matrix[s.skillName] = [];
      matrix[s.skillName].push({
        employeeName: `${s.employee.firstName} ${s.employee.lastName}`,
        proficiency: s.proficiency,
      });
    });
    return matrix;
  }

  async getEmployeeHistory(id: string): Promise<EmploymentHistory[]> {
    await this.findEmployeeById(id);
    return this.employmentHistoryRepo.find({
      where: { employeeId: id },
      order: { effectiveDate: 'DESC', createdAt: 'DESC' },
      relations: ['department', 'designation'],
    });
  }

  async getSalaryHistory(id: string): Promise<SalaryHistory[]> {
    await this.findEmployeeById(id);
    return this.salaryHistoryRepo.find({
      where: { employeeId: id },
      order: { effectiveDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async getTrainingCertificate(trainingId: string): Promise<Buffer> {
    const training = await this.trainingRepo.findOne({
      where: { id: trainingId },
      relations: ['employee'],
    });
    if (!training || training.status !== TrainingStatus.COMPLETED) {
      throw new NotFoundException('Completed training not found');
    }

    const template = `
      <div style="text-align: center; border: 10px solid #c3f5ff; padding: 50px;">
        <h1>CERTIFICATE OF COMPLETION</h1>
        <p>This is to certify that</p>
        <h2>${training.employee.firstName} ${training.employee.lastName}</h2>
        <p>has successfully completed the training</p>
        <h3>${training.title}</h3>
        <p>on ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    return this.pdfService.generatePdf(template, {});
  }

  async createDepartment(dto: any): Promise<Department> {
    const dept = this.departmentRepo.create(dto);
    return this.departmentRepo.save(dept) as any;
  }

  async findAllDepartments(): Promise<Department[]> {
    return this.departmentRepo.findTrees();
  }

  async findDepartmentById(id: string): Promise<Department> {
    const dept = await this.departmentRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async updateDepartment(id: string, dto: any): Promise<Department> {
    await this.findDepartmentById(id);
    await this.departmentRepo.update(id, dto);
    return this.findDepartmentById(id);
  }

  async removeDepartment(id: string): Promise<void> {
    await this.findDepartmentById(id);
    await this.departmentRepo.softDelete(id);
  }

  async createDesignation(dto: CreateDesignationDto): Promise<Designation> {
    const desig = this.designationRepo.create(dto);
    return this.designationRepo.save(desig);
  }

  async findAllDesignations(): Promise<Designation[]> {
    return this.designationRepo.find();
  }

  async findDesignationById(id: string): Promise<Designation> {
    const desig = await this.designationRepo.findOne({ where: { id } });
    if (!desig) throw new NotFoundException('Designation not found');
    return desig;
  }

  async updateDesignation(
    id: string,
    dto: UpdateDesignationDto,
  ): Promise<Designation> {
    await this.findDesignationById(id);
    await this.designationRepo.update(id, dto);
    return this.findDesignationById(id);
  }

  async removeDesignation(id: string): Promise<void> {
    await this.findDesignationById(id);
    await this.designationRepo.softDelete(id);
  }

  async getCount(): Promise<number> {
    return this.employeeRepo.count({ where: { deletedAt: null } as any });
  }
}
