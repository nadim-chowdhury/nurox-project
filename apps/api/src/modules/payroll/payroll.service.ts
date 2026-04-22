import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PayrollRun,
  Payslip,
  PayrollRunStatus,
} from './entities/payroll.entity';
import {
  SalaryStructure,
  EmployeeSalaryAssignment,
} from './entities/salary-structure.entity';
import { TaxConfiguration } from './entities/tax-bracket.entity';
import { SalaryHistory } from '../hr/entities/salary-history.entity';
import { AttendanceService } from '../hr/attendance.service';
import { PayrollComputeService } from './payroll-compute.service';
import { PdfService } from '../system/pdf.service';
import { StorageService } from '../system/storage.service';
import { AuditService } from '../system/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Employee } from '../hr/entities/employee.entity';

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name);

  constructor(
    @InjectRepository(PayrollRun)
    private readonly runRepo: Repository<PayrollRun>,
    @InjectRepository(Payslip)
    private readonly payslipRepo: Repository<Payslip>,
    @InjectRepository(SalaryStructure)
    private readonly structureRepo: Repository<SalaryStructure>,
    @InjectRepository(SalaryHistory)
    private readonly salaryHistoryRepo: Repository<SalaryHistory>,
    @InjectRepository(EmployeeSalaryAssignment)
    private readonly assignmentRepo: Repository<EmployeeSalaryAssignment>,
    @InjectRepository(TaxConfiguration)
    private readonly taxRepo: Repository<TaxConfiguration>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly attendanceService: AttendanceService,
    private readonly computeService: PayrollComputeService,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createStructure(dto: any): Promise<SalaryStructure> {
    const structure = this.structureRepo.create(dto);
    const saved: any = await this.structureRepo.save(structure);

    await this.auditService.log({
      userId: null, // Should come from req context in real app
      action: 'CREATE_SALARY_STRUCTURE',
      module: 'PAYROLL',
      description: `Created salary structure: ${saved.name}`,
      metadata: { structureId: saved.id },
    });

    return saved;
  }

  async findAllStructures(): Promise<SalaryStructure[]> {
    return this.structureRepo.find({ relations: ['components'] });
  }

  async assignStructure(employeeId: string, structureId: string) {
    let assignment = await this.assignmentRepo.findOne({
      where: { employeeId },
    });
    if (assignment) {
      assignment.salaryStructureId = structureId;
    } else {
      assignment = this.assignmentRepo.create({
        employeeId,
        salaryStructureId: structureId,
      });
    }
    return this.assignmentRepo.save(assignment);
  }

  async findAllTaxConfigs(): Promise<TaxConfiguration[]> {
    return this.taxRepo.find({
      relations: ['brackets'],
      order: { fiscalYear: 'DESC' },
    });
  }

  async createTaxConfig(dto: any): Promise<TaxConfiguration> {
    const config: any = this.taxRepo.create(dto);
    if (config.isActive) {
      await this.taxRepo.update({ isActive: true }, { isActive: false });
    }
    const saved: any = await this.taxRepo.save(config);

    await this.auditService.log({
      userId: null,
      action: 'CREATE_TAX_CONFIG',
      module: 'PAYROLL',
      description: `Created tax configuration for fiscal year ${saved.fiscalYear}`,
      metadata: { configId: saved.id },
    });

    return saved;
  }

  async createRun(period: string): Promise<PayrollRun> {
    const existing = await this.runRepo.findOne({ where: { period } });
    if (existing)
      throw new ConflictException(`Payroll run for ${period} already exists`);

    const runId = `PR-${period}`;
    const run = this.runRepo.create({
      runId,
      period,
      status: PayrollRunStatus.DRAFT,
    });
    return this.runRepo.save(run);
  }

  async processRun(runId: string) {
    const run = await this.runRepo.findOne({ where: { id: runId } });
    if (!run) throw new NotFoundException('Payroll run not found');
    if (run.status !== PayrollRunStatus.DRAFT)
      throw new ConflictException('Run is already processed or cancelled');

    const taxConfig = await this.taxRepo.findOne({
      where: { isActive: true },
      relations: ['brackets'],
    });
    const assignments = await this.assignmentRepo.find({
      where: { isActive: true },
      relations: ['salaryStructure', 'salaryStructure.components', 'employee'],
    });

    let totalGross = 0;
    let totalDeduction = 0;
    let totalNet = 0;

    const payslips: Payslip[] = [];

    for (const assign of assignments) {
      // Calculate Overtime for the month
      const attendance = await this.attendanceService.getTeamAttendance(
        run.period,
      ); // Period as prefix check
      const employeeAttendance = attendance.filter(
        (a) => a.employeeId === assign.employeeId,
      );
      const totalOtMins = employeeAttendance.reduce(
        (sum, a) => sum + (a.overtimeMinutes || 0),
        0,
      );
      const otHours = totalOtMins / 60;

      // Calculate Leave Encashment (e.g. at the end of fiscal year)
      let encashmentDays = 0;
      if (run.period.endsWith('-03')) {
        // Example: March is fiscal year end
        encashmentDays = await this.attendanceService.getEncashableLeaveDays(
          assign.employeeId,
          '2025-26',
        );
      }

      const { items, grossPay, totalDeductions, netPay } =
        this.computeService.calculatePayslipItems(
          Number(assign.employee.salary),
          assign.salaryStructure,
          taxConfig,
          otHours,
          (Number(assign.employee.salary) / 160) * 1.5, // 1.5x hourly rate (OT)
          0, // Bonus (mock)
          encashmentDays,
        );

      const payslip = this.payslipRepo.create({
        payrollRunId: run.id,
        employeeId: assign.employeeId,
        grossPay,
        totalDeductions,
        netPay,
        items,
      });

      payslips.push(payslip);
      totalGross += grossPay;
      totalDeduction += totalDeductions;
      totalNet += netPay;
    }

    await this.runRepo.manager.transaction(async (manager) => {
      await manager.save(payslips);
      run.status = PayrollRunStatus.REVIEW;
      run.totalGross = totalGross;
      run.totalDeductions = totalDeduction;
      run.totalNet = totalNet;
      run.employeeCount = assignments.length;
      await manager.save(run);
    });

    return run;
  }

  async approveRun(runId: string) {
    const run = await this.runRepo.findOne({ where: { id: runId } });
    if (!run) throw new NotFoundException('Payroll run not found');
    run.status = PayrollRunStatus.APPROVED;
    return this.runRepo.save(run);
  }

  async finalizeRun(runId: string) {
    const run = await this.runRepo.findOne({ where: { id: runId } });
    if (!run) throw new NotFoundException('Payroll run not found');

    run.status = PayrollRunStatus.PROCESSED;
    run.processedAt = new Date();
    await this.runRepo.save(run);

    // Emit event for Finance module to post journals
    this.eventEmitter.emit('payroll.processed', {
      runId: run.id,
      totalNet: run.totalNet,
      totalGross: run.totalGross,
      totalDeductions: run.totalDeductions,
      period: run.period,
    });

    return run;
  }

  async publishPayslips(runId: string) {
    await this.payslipRepo.update(
      { payrollRunId: runId },
      { isPublished: true },
    );
    return { success: true };
  }

  async getPayslipDownloadUrl(payslipId: string) {
    const payslip = await this.payslipRepo.findOne({
      where: { id: payslipId },
    });
    if (!payslip) throw new NotFoundException('Payslip not found');
    // Generate a pre-signed URL for the PDF
    const key = `payroll/payslips/${payslipId}.pdf`;
    return this.storageService.getDownloadPresignedUrl(key);
  }

  async getPayslipsByRun(runId: string): Promise<Payslip[]> {
    return this.payslipRepo.find({
      where: { payrollRunId: runId },
      relations: ['employee'],
    });
  }

  async getPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
    return this.payslipRepo.find({
      where: { employeeId, isPublished: true },
      relations: ['payrollRun'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPayslipPdf(payslipId: string): Promise<Buffer> {
    const payslip = await this.payslipRepo.findOne({
      where: { id: payslipId },
      relations: ['employee', 'payrollRun'],
    });
    if (!payslip) throw new NotFoundException('Payslip not found');

    const template = `
      <div style="font-family: 'Manrope', sans-serif; padding: 40px; color: #0c1324;">
        <div style="text-align: center; border-bottom: 2px solid #c3f5ff; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #00b96b; margin: 0;">NUROX ERP</h1>
          <p style="margin: 5px 0;">PAYSLIP FOR {{period}}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <p><b>Employee:</b> {{employeeName}}</p>
            <p><b>ID:</b> {{employeeCode}}</p>
          </div>
          <div style="text-align: right;">
            <p><b>Date:</b> {{date}}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f4f6f8;">
              <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Component</th>
              <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;">{{name}} ({{type}})</td>
              <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">{{amount}}</td>
            </tr>
            {{/each}}
          </tbody>
          <tfoot>
            <tr style="font-weight: bold;">
              <td style="padding: 10px; border: 1px solid #dee2e6;">Gross Pay</td>
              <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">{{grossPay}}</td>
            </tr>
            <tr style="font-weight: bold;">
              <td style="padding: 10px; border: 1px solid #dee2e6;">Total Deductions</td>
              <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">{{totalDeductions}}</td>
            </tr>
            <tr style="font-weight: bold; background-color: #c3f5ff;">
              <td style="padding: 10px; border: 1px solid #dee2e6;">Net Pay</td>
              <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">{{netPay}}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    const data = {
      period: payslip.payrollRun.period,
      employeeName: `${payslip.employee.firstName} ${payslip.employee.lastName}`,
      employeeCode: payslip.employee.employeeId,
      date: new Date().toLocaleDateString(),
      items: payslip.items,
      grossPay: payslip.grossPay,
      totalDeductions: payslip.totalDeductions,
      netPay: payslip.netPay,
    };

    return this.pdfService.generatePdf(template, data);
  }

  /**
   * Generates a BEFTN (Bangladesh Electronic Fund Transfer Network) tab-delimited file.
   */
  async generateBeftnExport(runId: string): Promise<string> {
    const payslips = await this.payslipRepo.find({
      where: { payrollRunId: runId },
      relations: ['employee'],
    });

    let content =
      'Receiver Name\tReceiver Account\tAmount\tBank Name\tBranch Name\tRouting Number\n';

    for (const p of payslips) {
      content += `${p.employee.firstName} ${p.employee.lastName}\t${p.employee.employeeId}_ACC\t${p.netPay}\tSample Bank\tMain Branch\t123456789\n`;
    }

    return content;
  }
}
