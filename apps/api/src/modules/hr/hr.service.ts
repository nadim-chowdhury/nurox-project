import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository, EntityManager } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Employee, EmployeeStatus } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import {
  PerformanceReview,
  PerformanceReviewStatus,
  KeyResult,
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
} from '@repo/shared-schemas';

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
    @InjectQueue('hr') private hrQueue: Queue,
  ) {}

  // ─── EMPLOYEES ──────────────────────────────────────────────

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeeRepo.findOne({
      where: [{ email: dto.email }, { employeeId: dto.employeeCode }],
    });
    if (existing) {
      throw new ConflictException(
        'Employee with this email or code already exists',
      );
    }

    return await this.employeeRepo.manager.transaction(async (manager) => {
      // Create Employee
      const employee = manager.create(Employee, {
        ...dto,
        employeeId: dto.employeeCode,
        salary: dto.baseSalary,
        joinDate: dto.joinDate.split('T')[0],
        probationEndDate: dto.probationEndDate
          ? dto.probationEndDate.split('T')[0]
          : null,
        contractUrl: dto.contractUrl || null,
        contractExpiryDate: dto.contractExpiryDate
          ? dto.contractExpiryDate.split('T')[0]
          : null,
      });
      const saved = await manager.save(employee);

      // Save initial Salary History
      const salaryHistory = manager.create(SalaryHistory, {
        employeeId: saved.id,
        previousSalary: 0,
        newSalary: dto.baseSalary,
        effectiveDate: dto.joinDate.split('T')[0],
        reason: SalaryChangeReason.INITIAL_OFFER,
        comments: 'Initial salary on hiring',
      });
      await manager.save(salaryHistory);

      // Save initial Employment History
      const employmentHistory = manager.create(EmploymentHistory, {
        employeeId: saved.id,
        event: EmploymentEvent.HIRED,
        effectiveDate: dto.joinDate.split('T')[0],
        departmentId: dto.departmentId,
        designationId: dto.designationId || null,
        comments: 'Employee hired',
      });
      await manager.save(employmentHistory);

      // Schedule probation expiry check
      if (dto.probationEndDate) {
        const delay = new Date(dto.probationEndDate).getTime() - Date.now();
        if (delay > 0) {
          await this.hrQueue.add(
            'probation-expiry-check',
            { employeeId: saved.id },
            { delay },
          );
        }
      }

      // Schedule contract expiry check (30 days before)
      if (dto.contractExpiryDate) {
        const expiryDate = new Date(dto.contractExpiryDate);
        const notificationDate = new Date(expiryDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        const delay = notificationDate.getTime() - Date.now();
        if (delay > 0) {
            await this.hrQueue.add(
                'contract-expiry-check',
                { employeeId: saved.id },
                { delay }
            );
        }
      }

      this.logger.log(
        `Employee created: ${saved.employeeId} — ${saved.firstName} ${saved.lastName}`,
      );
      return saved;
    });
  }

  async transferEmployee(id: string, dto: TransferEmployeeDto): Promise<Employee> {
    const employee = await this.findEmployeeById(id);
    
    return await this.employeeRepo.manager.transaction(async (manager) => {
        const oldDeptId = employee.departmentId;
        const oldDesigId = employee.designationId;

        employee.departmentId = dto.departmentId;
        employee.designationId = dto.designationId;
        await manager.save(employee);

        const history = manager.create(EmploymentHistory, {
            employeeId: id,
            event: EmploymentEvent.TRANSFERRED,
            effectiveDate: dto.effectiveDate.split('T')[0],
            departmentId: dto.departmentId,
            designationId: dto.designationId,
            comments: dto.comments || `Transferred from ${oldDeptId} to ${dto.departmentId}`,
        });
        await manager.save(history);

        return employee;
    });
  }

  async terminateEmployee(id: string, dto: TerminationDto): Promise<Employee> {
    const employee = await this.findEmployeeById(id);
    
    return await this.employeeRepo.manager.transaction(async (manager) => {
        employee.status = dto.reason === 'RESIGNED' ? EmployeeStatus.INACTIVE : EmployeeStatus.TERMINATED;
        employee.endDate = dto.endDate.split('T')[0];
        await manager.save(employee);

        const event = dto.reason === 'RESIGNED' ? EmploymentEvent.RESIGNED : EmploymentEvent.TERMINATED;

        const history = manager.create(EmploymentHistory, {
            employeeId: id,
            event: event,
            effectiveDate: dto.endDate.split('T')[0],
            comments: dto.comments || `Employee ${dto.reason.toLowerCase()}`,
        });
        await manager.save(history);

        return employee;
    });
  }

  async submit360Review(id: string, dto: ThreeSixtyReviewDto): Promise<PerformanceReview> {
    await this.findEmployeeById(id);
    const review = this.performanceRepo.create({
        employeeId: id,
        type: PerformanceReviewType.THREE_SIXTY,
        objective: dto.objective,
        period: dto.period,
        selfRating: dto.selfRating,
        peerRating: dto.peerRating || null,
        managerRating: dto.managerRating || null,
        status: PerformanceReviewStatus.COMPLETED,
    });
    return this.performanceRepo.save(review);
  }

  async initiatePIP(id: string, dto: PipDto): Promise<PerformanceReview> {
    await this.findEmployeeById(id);
    const pip = this.performanceRepo.create({
        employeeId: id,
        type: PerformanceReviewType.PIP,
        objective: dto.objective,
        period: dto.period,
        documentationUrl: dto.documentationUrl || null,
        status: PerformanceReviewStatus.ACTIVE,
    });
    return this.performanceRepo.save(pip);
  }

  async findAllEmployees(query: QueryEmployeeDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      employmentType,
      departmentId,
      designationId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const qb = this.employeeRepo
      .createQueryBuilder('emp')
      .leftJoinAndSelect('emp.department', 'dept')
      .leftJoinAndSelect('emp.designation', 'desig');

    if (search) {
      qb.andWhere(
        '(emp.firstName ILIKE :s OR emp.lastName ILIKE :s OR emp.email ILIKE :s OR emp.employeeId ILIKE :s)',
        { s: `%${search}%` },
      );
    }

    if (status) qb.andWhere('emp.status = :status', { status });
    if (employmentType)
      qb.andWhere('emp.employmentType = :employmentType', { employmentType });
    if (departmentId)
      qb.andWhere('emp.departmentId = :departmentId', { departmentId });
    if (designationId)
      qb.andWhere('emp.designationId = :designationId', { designationId });

    const allowedSort = [
      'createdAt',
      'firstName',
      'lastName',
      'joinDate',
      'salary',
      'employeeId',
    ];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`emp.${safeSort}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeRepo.findOne({
      where: { id },
      relations: ['department', 'designation'],
    });
    if (!employee) throw new NotFoundException(`Employee "${id}" not found`);
    return employee;
  }

  async updateEmployee(id: string, dto: any): Promise<Employee> {
    await this.findEmployeeById(id);
    await this.employeeRepo.update(id, dto);
    this.logger.log(`Employee updated: ${id}`);
    return this.findEmployeeById(id);
  }

  async updateSalary(
    id: string,
    newSalary: number,
    reason: SalaryChangeReason,
    comments?: string,
  ): Promise<Employee> {
    const employee = await this.findEmployeeById(id);
    const previousSalary = employee.salary;

    return await this.employeeRepo.manager.transaction(async (manager) => {
      employee.salary = newSalary;
      await manager.save(employee);

      const history = manager.create(SalaryHistory, {
        employeeId: id,
        previousSalary,
        newSalary,
        effectiveDate: new Date().toISOString().split('T')[0],
        reason,
        comments,
      });
      await manager.save(history);

      const employmentEvent = manager.create(EmploymentHistory, {
        employeeId: id,
        event: EmploymentEvent.SALARY_REVISION,
        effectiveDate: new Date().toISOString().split('T')[0],
        comments: `Salary revised from ${previousSalary} to ${newSalary}`,
      });
      await manager.save(employmentEvent);

      return employee;
    });
  }

  async addOKR(id: string, dto: OkrDto): Promise<PerformanceReview> {
    await this.findEmployeeById(id);
    const review = this.performanceRepo.create({
      employeeId: id,
      objective: dto.objective,
      period: dto.period,
      status: dto.status as PerformanceReviewStatus,
      progress: dto.progress,
      keyResults: dto.keyResults.map((kr) => ({
        description: kr.description,
        targetValue: kr.targetValue,
        currentValue: kr.currentValue,
        weight: kr.weight,
      })),
    });
    return this.performanceRepo.save(review);
  }

  async addTraining(id: string, dto: TrainingDto): Promise<Training> {
    await this.findEmployeeById(id);
    const training = this.trainingRepo.create({
      employeeId: id,
      ...dto,
      status: dto.status as TrainingStatus,
    });
    return this.trainingRepo.save(training);
  }

  async addSkill(id: string, dto: SkillDto): Promise<Skill> {
    await this.findEmployeeById(id);
    const skill = this.skillRepo.create({
      employeeId: id,
      ...dto,
      lastAssessed: dto.lastAssessed ? dto.lastAssessed.split('T')[0] : null,
    });
    return this.skillRepo.save(skill);
  }

  async findAllTrainings(): Promise<Training[]> {
    return this.trainingRepo.find({
        order: { title: 'ASC' },
        relations: ['employee'],
    });
  }

  async getSkillMatrix() {
    const skills = await this.skillRepo.find({
        relations: ['employee'],
    });

    // Group by skill name
    const matrix: Record<string, any[]> = {};
    skills.forEach(s => {
        if (!matrix[s.skillName]) matrix[s.skillName] = [];
        matrix[s.skillName].push({
            employeeId: s.employeeId,
            employeeName: `${s.employee.firstName} ${s.employee.lastName}`,
            proficiency: s.proficiency,
            lastAssessed: s.lastAssessed,
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

  async getTrainingCertificate(trainingId: string): Promise<Buffer> {
    const training = await this.trainingRepo.findOne({
      where: { id: trainingId },
      relations: ['employee'],
    });
    if (!training)
      throw new NotFoundException(`Training "${trainingId}" not found`);
    if (training.status !== TrainingStatus.COMPLETED) {
      throw new ConflictException(
        'Certificate is only available for completed trainings',
      );
    }

    const template = `
      <div style="text-align: center; border: 10px solid #c3f5ff; padding: 50px; font-family: 'Manrope', sans-serif; background-color: #0c1324; color: #e8eaf0;">
        <h1 style="color: #c3f5ff; font-family: 'Space Grotesk', sans-serif;">CERTIFICATE OF COMPLETION</h1>
        <p>This is to certify that</p>
        <h2 style="color: #c3f5ff;">{{firstName}} {{lastName}}</h2>
        <p>has successfully completed the training</p>
        <h3 style="color: #c3f5ff;">{{trainingTitle}}</h3>
        <p>on {{completionDate}}</p>
        <div style="margin-top: 50px;">
          <p>__________________________</p>
          <p>Nurox ERP Training Department</p>
        </div>
      </div>
    `;

    const data = {
      firstName: training.employee.firstName,
      lastName: training.employee.lastName,
      trainingTitle: training.title,
      completionDate: training.completionDate,
    };

    return this.pdfService.generatePdf(template, data);
  }

  async removeEmployee(id: string): Promise<void> {
    await this.findEmployeeById(id);
    await this.employeeRepo.softDelete(id);
    this.logger.log(`Employee soft-deleted: ${id}`);
  }

  // ─── DEPARTMENTS ────────────────────────────────────────────

  async createDepartment(dto: any): Promise<Department> {
    const existing = await this.departmentRepo.findOne({
      where: [{ name: dto.name }, { code: dto.code }],
    });
    if (existing)
      throw new ConflictException('Department name or code already exists');

    const dept = this.departmentRepo.create(dto) as unknown as Department;

    if (dto.parentId) {
      const parent = await this.findDepartmentById(dto.parentId);
      dept.parent = parent;
    }

    return this.departmentRepo.save(dept);
  }

  async findAllDepartments() {
    return this.departmentRepo.findTrees({
      relations: ['employees'],
    });
  }

  async findDepartmentById(id: string): Promise<Department> {
    const dept = await this.departmentRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!dept) throw new NotFoundException(`Department "${id}" not found`);
    return dept;
  }

  async updateDepartment(id: string, dto: any): Promise<Department> {
    const dept = await this.findDepartmentById(id);

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        dept.parent = null as any;
      } else {
        const parent = await this.findDepartmentById(dto.parentId);
        dept.parent = parent;
      }
    }

    Object.assign(dept, dto);
    return this.departmentRepo.save(dept);
  }

  async removeDepartment(id: string): Promise<void> {
    await this.findDepartmentById(id);
    await this.departmentRepo.softDelete(id);
  }

  // ─── DESIGNATIONS ──────────────────────────────────────────

  async createDesignation(dto: CreateDesignationDto): Promise<Designation> {
    const existing = await this.designationRepo.findOne({
      where: { title: dto.title },
    });
    if (existing)
      throw new ConflictException('Designation title already exists');

    const desig = this.designationRepo.create(dto);
    return this.designationRepo.save(desig);
  }

  async findAllDesignations() {
    const designations = await this.designationRepo.find({
      order: { level: 'ASC', title: 'ASC' },
    });

    const counts = await this.employeeRepo
      .createQueryBuilder('emp')
      .select('emp.designationId', 'designationId')
      .addSelect('COUNT(*)', 'count')
      .where('emp.deletedAt IS NULL')
      .groupBy('emp.designationId')
      .getRawMany<{ designationId: string; count: string }>();

    const countMap = new Map(
      counts.map((c) => [c.designationId, parseInt(c.count)]),
    );

    return designations.map((d) => ({
      ...d,
      employeeCount: countMap.get(d.id) || 0,
    }));
  }

  async findDesignationById(id: string): Promise<Designation> {
    const desig = await this.designationRepo.findOne({ where: { id } });
    if (!desig) throw new NotFoundException(`Designation "${id}" not found`);
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
