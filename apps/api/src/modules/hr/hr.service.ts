import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TreeRepository } from 'typeorm';
import { Employee, EmployeeStatus, Gender } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import {
  PerformanceReview,
  PerformanceReviewStatus,
  PerformanceReviewType,
  KeyResult,
} from './entities/performance.entity';
import { OKRCheckIn } from './entities/okr-checkin.entity';
import {
  SalaryHistory,
  SalaryChangeReason,
} from './entities/salary-history.entity';
import {
  SalaryRevision,
  RevisionStatus,
} from './entities/salary-revision.entity';
import {
  ProbationRecord,
  ProbationStatus,
} from './entities/probation-record.entity';
import {
  TransferRequest,
  TransferStatus,
} from './entities/transfer-request.entity';
import {
  ProfileChangeRequest,
  ProfileChangeStatus,
} from './entities/profile-change-request.entity';
import {
  Resignation,
  ResignationStatus,
} from './entities/resignation.entity';
import {
  Termination,
  TerminationType,
} from './entities/termination.entity';
import { ExitInterview } from './entities/exit-interview.entity';
import { ClearanceChecklist } from './entities/clearance-checklist.entity';
import { Shift } from './entities/shift.entity';
import { Training, TrainingStatus } from './entities/training.entity';
import { TrainingCourse } from './entities/training-course.entity';
import { Skill } from './entities/skill.entity';
import { SkillCatalog } from './entities/skill-catalog.entity';
import { ReviewFeedback, FeedbackType } from './entities/review-feedback.entity';
import { PIPActionPlan } from './entities/pip-action-plan.entity';
import { ENPSSurvey, ENPSResponse } from './entities/enps.entity';
import { Handbook, HandbookAcknowledgment } from './entities/handbook.entity';
import { SuccessionPlan, ReadinessLevel } from './entities/succession-plan.entity';
import {
  EmploymentHistory,
  EmploymentEvent,
} from './entities/employment-history.entity';
import { PdfService } from '../system/pdf.service';
import {
  CreateEmployeeDto,
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
export class HrService implements OnModuleInit {
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
    @InjectRepository(KeyResult)
    private readonly keyResultRepo: Repository<KeyResult>,
    @InjectRepository(OKRCheckIn)
    private readonly okrCheckInRepo: Repository<OKRCheckIn>,
    @InjectRepository(SalaryHistory)
    private readonly salaryHistoryRepo: Repository<SalaryHistory>,
    @InjectRepository(Training)
    private readonly trainingRepo: Repository<Training>,
    @InjectRepository(TrainingCourse)
    private readonly courseRepo: Repository<TrainingCourse>,
    @InjectRepository(Skill)
    private readonly skillRepo: Repository<Skill>,
    @InjectRepository(SkillCatalog)
    private readonly skillCatalogRepo: Repository<SkillCatalog>,
    @InjectRepository(ReviewFeedback)
    private readonly feedbackRepo: Repository<ReviewFeedback>,
    @InjectRepository(PIPActionPlan)
    private readonly pipRepo: Repository<PIPActionPlan>,
    @InjectRepository(ENPSSurvey)
    private readonly enpsSurveyRepo: Repository<ENPSSurvey>,
    @InjectRepository(ENPSResponse)
    private readonly enpsResponseRepo: Repository<ENPSResponse>,
    @InjectRepository(Handbook)
    private readonly handbookRepo: Repository<Handbook>,
    @InjectRepository(HandbookAcknowledgment)
    private readonly handbookAckRepo: Repository<HandbookAcknowledgment>,
    @InjectRepository(SuccessionPlan)
    private readonly successionRepo: Repository<SuccessionPlan>,
    @InjectRepository(EmploymentHistory)
    private readonly employmentHistoryRepo: Repository<EmploymentHistory>,
    @InjectRepository(SalaryRevision)
    private readonly salaryRevisionRepo: Repository<SalaryRevision>,
    @InjectRepository(ProbationRecord)
    private readonly probationRepo: Repository<ProbationRecord>,
    @InjectRepository(TransferRequest)
    private readonly transferRepo: Repository<TransferRequest>,
    @InjectRepository(ProfileChangeRequest)
    private readonly profileChangeRepo: Repository<ProfileChangeRequest>,
    @InjectRepository(Resignation)
    private readonly resignationRepo: Repository<Resignation>,
    @InjectRepository(Termination)
    private readonly terminationRepo: Repository<Termination>,
    @InjectRepository(ExitInterview)
    private readonly exitInterviewRepo: Repository<ExitInterview>,
    @InjectRepository(ClearanceChecklist)
    private readonly clearanceRepo: Repository<ClearanceChecklist>,
    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,
    private readonly pdfService: PdfService,
    @InjectQueue('hr')
    private readonly hrQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.hrQueue.add(
      'daily-milestone-check',
      {},
      {
        repeat: { cron: '0 9 * * *' }, // Daily at 9:00 AM
        jobId: 'daily-milestone-check',
        removeOnComplete: true,
      },
    );
    this.logger.log('Registered daily milestone check job');
  }

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
        const expiryDate = new Date(saved.probationEndDate);
        const reminders = [14, 7, 1];
        
        for (const days of reminders) {
          const reminderDate = new Date(expiryDate);
          reminderDate.setDate(reminderDate.getDate() - days);
          
          const delay = reminderDate.getTime() - Date.now();
          if (delay > 0) {
            await this.hrQueue.add(
              'probation-expiry-reminder',
              { employeeId: saved.id, daysLeft: days },
              { delay },
            );
          }
        }
      }

      if (saved.contractExpiryDate) {
        const expiryDate = new Date(saved.contractExpiryDate);
        const reminders = [90, 30, 7];
        
        for (const days of reminders) {
          const reminderDate = new Date(expiryDate);
          reminderDate.setDate(reminderDate.getDate() - days);
          
          const delay = reminderDate.getTime() - Date.now();
          if (delay > 0) {
            await this.hrQueue.add(
              'contract-expiry-reminder',
              { employeeId: saved.id, daysLeft: days },
              { delay },
            );
          }
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

  async getCount(managerId?: string): Promise<number> {
    const where: any = { deletedAt: null };
    if (managerId) where.managerId = managerId;
    return this.employeeRepo.count({ where });
  }

  async getOrgChart(): Promise<any> {
    const employees = await this.employeeRepo.find({
      where: { status: EmployeeStatus.ACTIVE },
      relations: ['designation', 'department'],
      select: ['id', 'firstName', 'lastName', 'managerId', 'avatarUrl'],
    });

    const map = new Map();
    const roots: any[] = [];

    employees.forEach((emp) => {
      map.set(emp.id, {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        attributes: {
          designation: emp.designation?.name || 'N/A',
          department: emp.department?.name || 'N/A',
        },
        avatarUrl: emp.avatarUrl,
        children: [],
      });
    });

    employees.forEach((emp) => {
      if (emp.managerId && map.has(emp.managerId)) {
        map.get(emp.managerId).children.push(map.get(emp.id));
      } else {
        roots.push(map.get(emp.id));
      }
    });

    return roots;
  }

  /**
   * SALARY REVISIONS & PROMOTIONS
   */

  async createSalaryRevision(dto: any): Promise<SalaryRevision> {
    const employee = await this.findEmployeeById(dto.employeeId);
    
    const revision = this.salaryRevisionRepo.create({
      ...dto,
      currentSalary: employee.salary,
      currentDesignationId: employee.designationId,
      currentGradeId: (employee as any).gradeId, // Employee has gradeId but might need cast if not in interface
      status: RevisionStatus.DRAFT,
    });

    return this.salaryRevisionRepo.save(revision);
  }

  async findAllSalaryRevisions(): Promise<SalaryRevision[]> {
    return this.salaryRevisionRepo.find({
      relations: ['employee', 'proposedDesignation', 'proposedGrade'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateSalaryRevisionStatus(id: string, dto: any): Promise<SalaryRevision> {
    const revision = await this.salaryRevisionRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!revision) throw new NotFoundException('Revision not found');

    revision.status = dto.status;
    if (dto.comments) revision.comments = dto.comments;

    if (dto.status === RevisionStatus.APPROVED) {
      revision.approvedAt = new Date();
      // In a real app, approvedById from context
    }

    const saved = await this.salaryRevisionRepo.save(revision);

    if (saved.status === RevisionStatus.APPLIED) {
      await this.applySalaryRevision(saved.id);
    }

    return saved;
  }

  async applySalaryRevision(id: string): Promise<void> {
    const revision = await this.salaryRevisionRepo.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!revision || revision.status !== RevisionStatus.APPLIED) {
      // If manually called, we should ensure it's approved first.
      // But usually it's called from updateSalaryRevisionStatus.
    }

    await this.employeeRepo.manager.transaction(async (manager) => {
      // 1. Update Employee
      const updateData: any = {
        salary: revision.proposedSalary,
      };
      if (revision.proposedDesignationId) {
        updateData.designationId = revision.proposedDesignationId;
      }
      if (revision.proposedGradeId) {
        updateData.gradeId = revision.proposedGradeId;
      }

      await manager.update(Employee, revision.employeeId, updateData);

      // 2. Add Salary History
      const salaryHistory = manager.create(SalaryHistory, {
        employeeId: revision.employeeId,
        previousSalary: revision.currentSalary,
        newSalary: revision.proposedSalary,
        effectiveDate: revision.effectiveDate,
        reason: revision.proposedDesignationId ? SalaryChangeReason.PROMOTION : SalaryChangeReason.ANNUAL_REVISION,
        comments: revision.comments || 'Salary revision applied',
      });
      await manager.save(salaryHistory);

      // 3. Add Employment History if designation changed
      if (revision.proposedDesignationId) {
        const history = manager.create(EmploymentHistory, {
          employeeId: revision.employeeId,
          event: EmploymentEvent.PROMOTED,
          effectiveDate: revision.effectiveDate,
          designationId: revision.proposedDesignationId,
          comments: revision.comments || 'Promotion applied',
        });
        await manager.save(history);
      }
    });
  }

  /**
   * PROBATION WORKFLOW
   */

  async extendProbation(employeeId: string, newEndDate: string, comments: string): Promise<ProbationRecord> {
    const employee = await this.findEmployeeById(employeeId);
    
    let record = await this.probationRepo.findOne({ where: { employeeId, status: ProbationStatus.PENDING } });
    
    if (!record) {
      record = this.probationRepo.create({
        employeeId,
        originalEndDate: employee.probationEndDate || new Date().toISOString(),
        currentEndDate: newEndDate,
        status: ProbationStatus.EXTENDED,
        extensionCount: 1,
        reviewComments: comments,
      });
    } else {
      record.currentEndDate = newEndDate;
      record.status = ProbationStatus.EXTENDED;
      record.extensionCount += 1;
      record.reviewComments = comments;
    }

    await this.employeeRepo.update(employeeId, { probationEndDate: newEndDate });
    
    // Reschedule jobs? 
    // In a real app, we should clear old jobs and add new ones.
    
    return this.probationRepo.save(record);
  }

  async completeProbation(employeeId: string, comments: string): Promise<ProbationRecord> {
    const employee = await this.findEmployeeById(employeeId);
    
    let record = await this.probationRepo.findOne({ where: { employeeId, status: ProbationStatus.PENDING } });
    
    if (!record) {
      record = this.probationRepo.create({
        employeeId,
        originalEndDate: employee.probationEndDate || new Date().toISOString(),
        currentEndDate: new Date().toISOString(),
        status: ProbationStatus.COMPLETED,
        reviewComments: comments,
      });
    } else {
      record.status = ProbationStatus.COMPLETED;
      record.reviewComments = comments;
    }

    await this.employeeRepo.manager.transaction(async (manager) => {
      await manager.update(Employee, employeeId, { 
        probationEndDate: null,
        employmentType: EmployeeStatus.ACTIVE, // Assuming they move to regular
      });

      const history = manager.create(EmploymentHistory, {
        employeeId,
        event: EmploymentEvent.PROBATION_COMPLETED,
        effectiveDate: new Date().toISOString(),
        comments,
      });
      await manager.save(history);
    });

    return this.probationRepo.save(record);
  }

  /**
   * TRANSFER WORKFLOW
   */

  async createTransferRequest(dto: any): Promise<TransferRequest> {
    const employee = await this.findEmployeeById(dto.employeeId);
    
    const request = this.transferRepo.create({
      ...dto,
      oldDepartmentId: employee.departmentId,
      oldBranchId: (employee as any).branchId,
      status: TransferStatus.PENDING,
    });

    return this.transferRepo.save(request);
  }

  async findAllTransferRequests(): Promise<TransferRequest[]> {
    return this.transferRepo.find({
      relations: ['employee', 'newDepartment', 'newBranch', 'oldDepartment', 'oldBranch'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateTransferRequestStatus(id: string, dto: any): Promise<TransferRequest> {
    const request = await this.transferRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!request) throw new NotFoundException('Transfer request not found');

    request.status = dto.status;
    if (dto.status === TransferStatus.APPROVED) {
      request.approvedAt = new Date();
    }

    const saved = await this.transferRepo.save(request);

    if (saved.status === TransferStatus.COMPLETED) {
      await this.applyTransfer(saved.id);
    }

    return saved;
  }

  async applyTransfer(id: string): Promise<void> {
    const request = await this.transferRepo.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!request || request.status !== TransferStatus.COMPLETED) {
      // Logic for applying transfer
    }

    await this.employeeRepo.manager.transaction(async (manager) => {
      // 1. Update Employee
      await manager.update(Employee, request.employeeId, {
        departmentId: request.newDepartmentId,
        branchId: request.newBranchId as any,
      });

      // 2. Add Employment History
      const history = manager.create(EmploymentHistory, {
        employeeId: request.employeeId,
        event: EmploymentEvent.TRANSFERRED,
        effectiveDate: request.effectiveDate,
        departmentId: request.newDepartmentId,
        comments: request.reason || 'Branch/Department transfer applied',
      });
      await manager.save(history);
    });
  }

  /**
   * SELF-SERVICE PROFILE CHANGES
   */

  async createProfileChangeRequest(employeeId: string, changes: any): Promise<ProfileChangeRequest> {
    const request = this.profileChangeRepo.create({
      employeeId,
      changes,
      status: ProfileChangeStatus.PENDING,
    });
    return this.profileChangeRepo.save(request);
  }

  async findAllProfileChangeRequests(): Promise<ProfileChangeRequest[]> {
    return this.profileChangeRepo.find({
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateProfileChangeRequestStatus(id: string, dto: any): Promise<ProfileChangeRequest> {
    const request = await this.profileChangeRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!request) throw new NotFoundException('Change request not found');

    request.status = dto.status;
    if (dto.rejectionReason) request.rejectionReason = dto.rejectionReason;
    
    if (dto.status === ProfileChangeStatus.APPROVED) {
      request.approvedAt = new Date();
      // Apply changes
      await this.applyProfileChange(request);
    }

    return this.profileChangeRepo.save(request);
  }

  private async applyProfileChange(request: ProfileChangeRequest): Promise<void> {
    await this.employeeRepo.update(request.employeeId, request.changes);
  }

  /**
   * EXIT WORKFLOWS (RESIGNATION & TERMINATION)
   */

  async createResignation(employeeId: string, dto: any): Promise<Resignation> {
    const resignation = this.resignationRepo.create({
      employeeId,
      ...dto,
      status: ResignationStatus.PENDING,
      submissionDate: new Date().toISOString(),
    });
    return this.resignationRepo.save(resignation);
  }

  async updateResignationStatus(id: string, dto: any): Promise<Resignation> {
    const resignation = await this.resignationRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!resignation) throw new NotFoundException('Resignation not found');

    resignation.status = dto.status;
    if (dto.approvedLastWorkingDay)
      resignation.approvedLastWorkingDay = dto.approvedLastWorkingDay;
    if (dto.adminComments) resignation.adminComments = dto.adminComments;

    if (dto.status === ResignationStatus.APPROVED) {
      resignation.approvedAt = new Date();
      // Update employee status to show they are serving notice if we had such status
    }

    if (dto.status === ResignationStatus.COMPLETED) {
      await this.employeeRepo.update(resignation.employeeId, {
        status: EmployeeStatus.RESIGNED,
        endDate: resignation.approvedLastWorkingDay || resignation.requestedLastWorkingDay,
      });

      const history = this.employmentHistoryRepo.create({
        employeeId: resignation.employeeId,
        event: EmploymentEvent.EXITED,
        effectiveDate: resignation.approvedLastWorkingDay || resignation.requestedLastWorkingDay,
        comments: 'Resignation completed',
      });
      await this.employmentHistoryRepo.save(history);
    }

    return this.resignationRepo.save(resignation);
  }

  async createTermination(dto: any): Promise<Termination> {
    const termination = this.terminationRepo.create({
      ...dto,
    });

    await this.employeeRepo.manager.transaction(async (manager) => {
      await manager.update(Employee, dto.employeeId, {
        status: EmployeeStatus.TERMINATED,
        endDate: dto.lastWorkingDay,
      });

      const history = manager.create(EmploymentHistory, {
        employeeId: dto.employeeId,
        event: EmploymentEvent.EXITED,
        effectiveDate: dto.lastWorkingDay,
        comments: `Terminated: ${dto.reason}`,
      });
      await manager.save(history);
    });

    return this.terminationRepo.save(termination);
  }

  async getClearanceChecklist(employeeId: string): Promise<ClearanceChecklist[]> {
    return this.clearanceRepo.find({ where: { employeeId } });
  }

  async updateClearanceItem(id: string, isCleared: boolean, remarks?: string): Promise<ClearanceChecklist> {
    const item = await this.clearanceRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Clearance item not found');

    item.isCleared = isCleared;
    if (remarks) item.remarks = remarks;
    if (isCleared) item.clearedAt = new Date().toISOString();

    return this.clearanceRepo.save(item);
  }

  async submitExitInterview(employeeId: string, responses: any): Promise<ExitInterview> {
    const interview = this.exitInterviewRepo.create({
      employeeId,
      responses,
      interviewDate: new Date().toISOString(),
    });
    return this.exitInterviewRepo.save(interview);
  }

  /**
   * PERFORMANCE & OKRS
   */

  async createOKRCheckIn(dto: any): Promise<OKRCheckIn> {
    const checkIn = this.okrCheckInRepo.create({
      ...dto,
      checkInDate: new Date().toISOString(),
    });

    const saved = await this.okrCheckInRepo.save(checkIn);

    // Update current value in KeyResult
    await this.keyResultRepo.update(dto.keyResultId, { currentValue: dto.value });

    // Recalculate overall OKR progress
    const keyResult = await this.keyResultRepo.findOne({ 
      where: { id: dto.keyResultId },
      relations: ['performanceReview']
    });
    
    if (keyResult) {
      await this.calculateOKRProgress(keyResult.performanceReviewId);
    }

    return saved;
  }

  async calculateOKRProgress(performanceReviewId: string): Promise<number> {
    const review = await this.performanceRepo.findOne({
      where: { id: performanceReviewId },
      relations: ['keyResults'],
    });

    if (!review || !review.keyResults.length) return 0;

    let totalProgress = 0;
    let totalWeight = 0;

    review.keyResults.forEach(kr => {
      const progress = Math.min((Number(kr.currentValue) / Number(kr.targetValue)) * 100, 100);
      totalProgress += progress * (Number(kr.weight) / 100);
      totalWeight += Number(kr.weight);
    });

    // If weights don't add up to 100, normalize? 
    // For now just use the weighted average
    const finalProgress = Math.round(totalProgress);
    await this.performanceRepo.update(performanceReviewId, { progress: finalProgress });

    return finalProgress;
  }

  /**
   * TRAINING CATALOG & ENROLLMENT
   */

  async createTrainingCourse(dto: any): Promise<TrainingCourse> {
    const course = this.courseRepo.create(dto);
    return this.courseRepo.save(course);
  }

  async findAllTrainingCourses(): Promise<TrainingCourse[]> {
    return this.courseRepo.find({ where: { isActive: true } });
  }

  async enrollEmployeeInTraining(employeeId: string, courseId: string): Promise<Training> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const training = this.trainingRepo.create({
      employeeId,
      courseId,
      title: course.title,
      description: course.description,
      category: course.category,
      provider: course.provider,
      durationHours: course.durationHours,
      status: TrainingStatus.ENROLLED,
    });

    return this.trainingRepo.save(training);
  }

  async updateTrainingStatus(id: string, status: TrainingStatus, certificateUrl?: string): Promise<Training> {
    const training = await this.trainingRepo.findOne({ where: { id } });
    if (!training) throw new NotFoundException('Training record not found');

    training.status = status;
    if (certificateUrl) training.certificateUrl = certificateUrl;
    if (status === TrainingStatus.COMPLETED) {
      training.completionDate = new Date().toISOString();
    }

    return this.trainingRepo.save(training);
  }

  /**
   * SKILL MATRIX & CATALOG
   */

  async createSkillInCatalog(dto: any): Promise<SkillCatalog> {
    const skill = this.skillCatalogRepo.create(dto);
    return this.skillCatalogRepo.save(skill);
  }

  async findAllSkillsInCatalog(): Promise<SkillCatalog[]> {
    return this.skillCatalogRepo.find({ where: { isActive: true } });
  }

  async addSkillToEmployee(employeeId: string, catalogId: string, proficiency: number): Promise<Skill> {
    const catalogItem = await this.skillCatalogRepo.findOne({ where: { id: catalogId } });
    if (!catalogItem) throw new NotFoundException('Skill not found in catalog');

    const skill = this.skillRepo.create({
      employeeId,
      catalogId,
      skillName: catalogItem.name,
      proficiency,
      lastAssessed: new Date().toISOString(),
    });

    return this.skillRepo.save(skill);
  }

  async getSkillMatrix(): Promise<any> {
    const skills = await this.skillRepo.find({
      relations: ['employee', 'catalog'],
    });

    // Transform into a matrix format for the grid view
    // Group by employee
    const matrix = {};
    skills.forEach(s => {
      const empName = `${s.employee.firstName} ${s.employee.lastName}`;
      if (!matrix[empName]) matrix[empName] = {};
      matrix[empName][s.skillName] = s.proficiency;
    });

    return matrix;
  }

  /**
   * 360 DEGREE REVIEWS
   */

  async submitReviewFeedback(dto: any): Promise<ReviewFeedback> {
    const feedback = this.feedbackRepo.create(dto);
    return this.feedbackRepo.save(feedback);
  }

  async getReviewFeedbackSummary(performanceReviewId: string): Promise<any> {
    const feedbackList = await this.feedbackRepo.find({
      where: { performanceReviewId },
    });

    const summary = {
      averageRating: 0,
      breakdown: {
        PEER: { count: 0, avg: 0 },
        SUBORDINATE: { count: 0, avg: 0 },
        MANAGER: { count: 0, avg: 0 },
        SELF: { count: 0, avg: 0 },
      },
      comments: [],
    };

    if (!feedbackList.length) return summary;

    let totalRating = 0;
    feedbackList.forEach(f => {
      totalRating += f.rating;
      summary.breakdown[f.type].count += 1;
      summary.breakdown[f.type].avg += f.rating;
      summary.comments.push({ type: f.type, comment: f.comment, date: f.submittedAt });
    });

    summary.averageRating = Number((totalRating / feedbackList.length).toFixed(2));
    
    Object.keys(summary.breakdown).forEach(type => {
      if (summary.breakdown[type].count > 0) {
        summary.breakdown[type].avg = Number((summary.breakdown[type].avg / summary.breakdown[type].count).toFixed(2));
      }
    });

    return summary;
  }

  /**
   * PERFORMANCE IMPROVEMENT PLANS (PIP)
   */

  async createPIPActionPlan(dto: any): Promise<PIPActionPlan> {
    const plan = this.pipRepo.create(dto);
    return this.pipRepo.save(plan);
  }

  async getPIPActionPlans(performanceReviewId: string): Promise<PIPActionPlan[]> {
    return this.pipRepo.find({
      where: { performanceReviewId },
      order: { reviewDate: 'ASC' },
    });
  }

  async updatePIPActionPlanStatus(id: string, isAchieved: boolean, notes?: string): Promise<PIPActionPlan> {
    const plan = await this.pipRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('PIP plan not found');

    plan.isAchieved = isAchieved;
    if (notes) plan.progressNotes = notes;

    return this.pipRepo.save(plan);
  }

  /**
   * ENPS (EMPLOYEE NPS) SURVEYS
   */

  async createENPSSurvey(dto: any): Promise<ENPSSurvey> {
    const survey = this.enpsSurveyRepo.create(dto);
    return this.enpsSurveyRepo.save(survey);
  }

  async findAllENPSSurveys(): Promise<ENPSSurvey[]> {
    return this.enpsSurveyRepo.find({ order: { startDate: 'DESC' } });
  }

  async submitENPSResponse(dto: any): Promise<ENPSResponse> {
    const response = this.enpsResponseRepo.create(dto);
    return this.enpsResponseRepo.save(response);
  }

  async getENPSAnalytics(surveyId: string): Promise<any> {
    const responses = await this.enpsResponseRepo.find({
      where: { surveyId },
      relations: ['department'],
    });

    if (!responses.length) return { score: 0, promoters: 0, passives: 0, detractors: 0 };

    let promoters = 0; // 9-10
    let passives = 0; // 7-8
    let detractors = 0; // 0-6

    responses.forEach(r => {
      if (r.score >= 9) promoters++;
      else if (r.score >= 7) passives++;
      else detractors++;
    });

    const total = responses.length;
    const score = Math.round(((promoters - detractors) / total) * 100);

    return {
      score,
      total,
      breakdown: {
        promoters,
        passives,
        detractors,
      },
      percentages: {
        promoters: Math.round((promoters / total) * 100),
        passives: Math.round((passives / total) * 100),
        detractors: Math.round((detractors / total) * 100),
      }
    };
  }

  /**
   * EMPLOYEE HANDBOOK
   */

  async createHandbook(dto: any): Promise<Handbook> {
    const handbook = this.handbookRepo.create(dto);
    return this.handbookRepo.save(handbook);
  }

  async findAllHandbooks(): Promise<Handbook[]> {
    return this.handbookRepo.find({ order: { version: 'DESC' } });
  }

  async acknowledgeHandbook(employeeId: string, handbookId: string, metadata: any): Promise<HandbookAcknowledgment> {
    const ack = this.handbookAckRepo.create({
      employeeId,
      handbookId,
      ...metadata,
    });
    return this.handbookAckRepo.save(ack);
  }

  /**
   * SUCCESSION PLANNING
   */

  async createSuccessionPlan(dto: any): Promise<SuccessionPlan> {
    const plan = this.successionRepo.create(dto);
    return this.successionRepo.save(plan);
  }

  async getSuccessionPlansByDesignation(designationId: string): Promise<SuccessionPlan[]> {
    return this.successionRepo.find({
      where: { designationId, isActive: true },
      relations: ['successor'],
    });
  }

  async getSuccessionPlansByEmployee(employeeId: string): Promise<SuccessionPlan[]> {
    return this.successionRepo.find({
      where: { successorId: employeeId, isActive: true },
      relations: ['designation'],
    });
  }

  /**
   * PDF GENERATION
   */

  async generatePIPLetter(performanceReviewId: string): Promise<Buffer> {
    const review = await this.performanceRepo.findOne({
      where: { id: performanceReviewId },
      relations: ['employee', 'employee.department'],
    });
    
    const actions = await this.getPIPActionPlans(performanceReviewId);

    const template = `
      <h1>Performance Improvement Plan</h1>
      <p><b>Employee:</b> {{employee.firstName} {{employee.lastName}}</p>
      <p><b>Department:</b> {{employee.department.name}}</p>
      <p><b>Period:</b> {{period}}</p>
      <h2>Objectives</h2>
      <p>{{objective}}</p>
      <h2>Action Items</h2>
      <ul>
        {{#each actions}}
          <li><b>{{targetArea}}:</b> {{expectedOutcome}} (Review: {{reviewDate}})</li>
        {{/each}}
      </ul>
    `;

    return this.pdfService.generatePdf(template, { ...review, actions });
  }

  async generateTrainingCertificate(trainingId: string): Promise<Buffer> {
    const training = await this.trainingRepo.findOne({
      where: { id: trainingId },
      relations: ['employee'],
    });

    const template = `
      <div style="text-align: center; border: 10px solid #c3f5ff; padding: 50px;">
        <h1>Certificate of Completion</h1>
        <p>This is to certify that</p>
        <h2>{{employee.firstName}} {{employee.lastName}}</h2>
        <p>has successfully completed the course</p>
        <h3>{{title}}</h3>
        <p>on {{completionDate}}</p>
        <p><b>Provider:</b> {{provider}}</p>
      </div>
    `;

    return this.pdfService.generatePdf(template, training);
  }
}
