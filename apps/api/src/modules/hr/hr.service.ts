import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Designation } from './entities/designation.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { QueryEmployeeDto } from './dto/query-employee.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { UpdateDesignationDto } from './dto/update-designation.dto';

@Injectable()
export class HrService {
  private readonly logger = new Logger(HrService.name);

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,
    @InjectRepository(Designation)
    private readonly designationRepo: Repository<Designation>,
  ) {}

  // ─── EMPLOYEES ──────────────────────────────────────────────

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.employeeRepo.findOne({
      where: [{ email: dto.email }, { employeeId: dto.employeeId }],
    });
    if (existing) {
      throw new ConflictException(
        'Employee with this email or ID already exists',
      );
    }

    const employee = this.employeeRepo.create(dto);
    const saved = await this.employeeRepo.save(employee);
    this.logger.log(
      `Employee created: ${saved.employeeId} — ${saved.firstName} ${saved.lastName}`,
    );
    return this.findEmployeeById(saved.id);
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

  async updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    await this.findEmployeeById(id);
    await this.employeeRepo.update(id, dto);
    this.logger.log(`Employee updated: ${id}`);
    return this.findEmployeeById(id);
  }

  async removeEmployee(id: string): Promise<void> {
    await this.findEmployeeById(id);
    await this.employeeRepo.softDelete(id);
    this.logger.log(`Employee soft-deleted: ${id}`);
  }

  // ─── DEPARTMENTS ────────────────────────────────────────────

  async createDepartment(dto: CreateDepartmentDto): Promise<Department> {
    const existing = await this.departmentRepo.findOne({
      where: [{ name: dto.name }, { code: dto.code }],
    });
    if (existing)
      throw new ConflictException('Department name or code already exists');

    const dept = this.departmentRepo.create(dto);
    return this.departmentRepo.save(dept);
  }

  async findAllDepartments() {
    const departments = await this.departmentRepo.find({
      order: { name: 'ASC' },
    });

    // Get employee counts per department
    const counts = await this.employeeRepo
      .createQueryBuilder('emp')
      .select('emp.departmentId', 'departmentId')
      .addSelect('COUNT(*)', 'count')
      .where('emp.deletedAt IS NULL')
      .groupBy('emp.departmentId')
      .getRawMany<{ departmentId: string; count: string }>();

    const countMap = new Map(
      counts.map((c) => [c.departmentId, parseInt(c.count)]),
    );

    return departments.map((d) => ({
      ...d,
      employeeCount: countMap.get(d.id) || 0,
    }));
  }

  async findDepartmentById(id: string): Promise<Department> {
    const dept = await this.departmentRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException(`Department "${id}" not found`);
    return dept;
  }

  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto,
  ): Promise<Department> {
    await this.findDepartmentById(id);
    await this.departmentRepo.update(id, dto);
    return this.findDepartmentById(id);
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
}
