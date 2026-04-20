import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PayrollRun, Payslip } from './entities/payroll.entity';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @InjectRepository(PayrollRun)
    private readonly runRepo: Repository<PayrollRun>,
    @InjectRepository(Payslip)
    private readonly payslipRepo: Repository<Payslip>,
  ) {}

  // ─── PAYROLL RUNS ───────────────────────────────────────────

  async createRun(dto: Partial<PayrollRun>): Promise<PayrollRun> {
    const exists = await this.runRepo.findOne({ where: { runId: dto.runId } });
    if (exists)
      throw new ConflictException(`Payroll run "${dto.runId}" exists`);
    const run = this.runRepo.create(dto);
    const saved = await this.runRepo.save(run);
    this.logger.log(`Payroll run created: ${saved.runId}`);
    return saved;
  }

  async findAllRuns(page = 1, limit = 20) {
    const [data, total] = await this.runRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findRunById(id: string): Promise<PayrollRun> {
    const run = await this.runRepo.findOne({ where: { id } });
    if (!run) throw new NotFoundException(`Payroll run "${id}" not found`);
    return run;
  }

  async updateRun(id: string, dto: Partial<PayrollRun>): Promise<PayrollRun> {
    await this.findRunById(id);
    await this.runRepo.update(id, dto);
    return this.findRunById(id);
  }

  async removeRun(id: string): Promise<void> {
    await this.findRunById(id);
    await this.runRepo.softDelete(id);
  }

  // ─── PAYSLIPS ───────────────────────────────────────────────

  async createPayslip(dto: Partial<Payslip>): Promise<Payslip> {
    const payslip = this.payslipRepo.create({
      ...dto,
      grossPay: Number(dto.basicSalary || 0) + Number(dto.allowances || 0),
      netPay:
        Number(dto.basicSalary || 0) +
        Number(dto.allowances || 0) -
        Number(dto.tax || 0) -
        Number(dto.otherDeductions || 0),
    });
    return this.payslipRepo.save(payslip);
  }

  async findPayslipsByRun(runId: string) {
    return this.payslipRepo.find({
      where: { payrollRunId: runId },
      order: { employeeName: 'ASC' },
    });
  }

  async findPayslipsByEmployee(employeeId: string) {
    return this.payslipRepo.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findPayslipById(id: string): Promise<Payslip> {
    const ps = await this.payslipRepo.findOne({ where: { id } });
    if (!ps) throw new NotFoundException(`Payslip "${id}" not found`);
    return ps;
  }
}
