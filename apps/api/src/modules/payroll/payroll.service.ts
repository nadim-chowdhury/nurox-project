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
import {
  EmployeeLoan,
  LoanRepayment,
  LoanStatus,
} from './entities/loan.entity';
import {
  AdvanceSalaryRequest,
  AdvanceSalaryStatus,
} from './entities/advance-salary.entity';
import { EmployeeBonus } from './entities/bonus.entity';
import { PayrollAudit } from './entities/payroll-audit.entity';
import { SalaryHistory } from '../hr/entities/salary-history.entity';
import { AttendanceRecord } from '../attendance/entities/attendance.entity';
import { AttendanceService } from '../attendance/attendance.service';
import { LeaveService } from '../leave/leave.service';
import { PayrollComputeService } from './payroll-compute.service';
import { PdfService } from '../system/pdf.service';
import { StorageService } from '../system/storage.service';
import { AuditService } from '../system/audit.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Employee } from '../hr/entities/employee.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ClsService } from 'nestjs-cls';

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
    @InjectRepository(EmployeeLoan)
    private readonly loanRepo: Repository<EmployeeLoan>,
    @InjectRepository(LoanRepayment)
    private readonly repaymentRepo: Repository<LoanRepayment>,
    @InjectRepository(AdvanceSalaryRequest)
    private readonly advanceRepo: Repository<AdvanceSalaryRequest>,
    @InjectRepository(EmployeeBonus)
    private readonly bonusRepo: Repository<EmployeeBonus>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(PayrollAudit)
    private readonly auditRepo: Repository<PayrollAudit>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly attendanceService: AttendanceService,
    private readonly leaveService: LeaveService,
    private readonly computeService: PayrollComputeService,
    private readonly pdfService: PdfService,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
    @InjectQueue('payroll')
    private readonly payrollQueue: Queue,
    private readonly cls: ClsService,
  ) {}

  async createStructure(dto: any): Promise<SalaryStructure> {
    const structure = this.structureRepo.create(dto);
    const saved: any = await this.structureRepo.save(structure);

    await this.auditService.log({
      tenantId: this.cls.get('tenantId'),
      userId: this.cls.get('userId'),
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
      tenantId: this.cls.get('tenantId'),
      userId: this.cls.get('userId'),
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

  /**
   * Creates an off-cycle payroll run for a specific employee.
   */
  async createOffCycleRun(
    employeeId: string,
    period: string,
    _type: string,
  ): Promise<PayrollRun> {
    const runId = `OC-${employeeId.slice(0, 4)}-${period}-${Date.now().toString().slice(-4)}`;

    const run = this.runRepo.create({
      runId,
      period,
      status: PayrollRunStatus.DRAFT,
      // Metadata could be stored in a JSON field if needed
    });

    const savedRun = await this.runRepo.save(run);

    // We can immediately process it for this employee
    // In a real app, maybe you want to review first.
    return savedRun;
  }

  async processRun(runId: string, employeeId?: string) {
    const run = await this.runRepo.findOne({ where: { id: runId } });
    if (!run) throw new NotFoundException('Payroll run not found');
    if (run.status !== PayrollRunStatus.DRAFT)
      throw new ConflictException('Run is already processed or cancelled');

    const taxConfig = await this.taxRepo.findOne({
      where: { isActive: true },
      relations: ['brackets'],
    });

    const assignmentWhere: any = { isActive: true };
    if (employeeId) assignmentWhere.employeeId = employeeId;

    const assignments = await this.assignmentRepo.find({
      where: assignmentWhere,
      relations: ['salaryStructure', 'salaryStructure.components', 'employee'],
    });

    let totalGross = 0;
    let totalDeduction = 0;
    let totalNet = 0;

    const payslips: Payslip[] = [];

    for (const assign of assignments) {
      if (assign.employee.isSalaryOnHold) {
        this.logger.log(
          `Skipping employee ${assign.employee.firstName} ${assign.employee.lastName} (Salary on hold)`,
        );
        continue;
      }

      // Calculate Overtime for the month
      const attendance = await this.attendanceService.getTeamAttendance(
        run.period,
      ); // Period as prefix check
      const employeeAttendance = attendance.filter(
        (a) => a.employeeId === assign.employeeId,
      );
      const totalOtMins = employeeAttendance.reduce(
        (sum, a) => sum + (a.isOvertimeApproved ? a.overtimeMinutes || 0 : 0),
        0,
      );
      const otHours = totalOtMins / 60;

      // Calculate Leave Encashment (e.g. at the end of fiscal year)
      let encashmentDays = 0;
      if (run.period.endsWith('-03')) {
        // Example: March is fiscal year end
        encashmentDays = await this.leaveService.getEncashableLeaveDays(
          assign.employeeId,
          '2025-26',
        );
      }

      // Calculate Arrears
      const arrears = await this.getArrearsForEmployee(
        assign.employeeId,
        run.period,
      );

      // Fetch active loans and calculate deduction
      const loans = await this.loanRepo.find({
        where: { employeeId: assign.employeeId, status: LoanStatus.ACTIVE },
      });
      const loanDeduction = loans.reduce(
        (sum, l) => sum + Number(l.monthlyDeduction),
        0,
      );

      // Fetch approved advances for this period
      const advances = await this.advanceRepo.find({
        where: {
          employeeId: assign.employeeId,
          status: AdvanceSalaryStatus.APPROVED,
          deductionPeriod: run.period,
        },
      });
      const advanceDeduction = advances.reduce(
        (sum, a) => sum + Number(a.amount),
        0,
      );

      // Fetch bonuses for this period
      const bonuses = await this.bonusRepo.find({
        where: {
          employeeId: assign.employeeId,
          payrollPeriod: run.period,
          isProcessed: false,
        },
      });
      const totalBonus = bonuses.reduce((sum, b) => sum + Number(b.amount), 0);

      const {
        items,
        grossPay,
        totalDeductions,
        netPay,
        employerPfContribution,
      } = this.computeService.calculatePayslipItems(
        Number(assign.employee.salary),
        assign.salaryStructure,
        taxConfig,
        otHours,
        (Number(assign.employee.salary) / 160) * 1.5,
        totalBonus,
        encashmentDays,
        arrears,
        loanDeduction,
        advanceDeduction,
      );

      const payslip = this.payslipRepo.create({
        payrollRunId: run.id,
        employeeId: assign.employeeId,
        grossPay,
        totalDeductions,
        netPay,
        employerPfContribution,
        items,
        payoutCurrency: assign.employee.preferredCurrency || 'USD',
        exchangeRate:
          assign.employee.preferredCurrency &&
          assign.employee.preferredCurrency !== 'USD'
            ? 110.0
            : 1, // Mock rate for BDT
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

      // Audit Log
      await this.logPayrollAudit(run.id, 'COMPUTE', null, {
        employeeCount: assignments.length,
        totalGross,
        totalNet,
      });
    });

    return run;
  }

  private async logPayrollAudit(
    runId: string,
    action: string,
    before: any,
    after: any,
  ) {
    await this.auditRepo.save(
      this.auditRepo.create({
        payrollRunId: runId,
        action,
        beforeValue: before,
        afterValue: after,
        // actorId would come from context
      }),
    );
  }

  async approveRun(runId: string) {
    const run = await this.runRepo.findOne({ where: { id: runId } });
    if (!run) throw new NotFoundException('Payroll run not found');
    const oldStatus = run.status;
    run.status = PayrollRunStatus.APPROVED;
    const saved = await this.runRepo.save(run);

    await this.logPayrollAudit(
      run.id,
      'APPROVE',
      { status: oldStatus },
      { status: run.status },
    );
    return saved;
  }

  async finalizeRun(runId: string) {
    const run = await this.runRepo.findOne({
      where: { id: runId },
      relations: ['payslips'],
    });
    if (!run) throw new NotFoundException('Payroll run not found');

    await this.runRepo.manager.transaction(async (manager) => {
      // 1. Process Loans and Advances per employee in this run
      for (const payslip of run.payslips) {
        // Handle Loans
        const activeLoans = await manager.find(EmployeeLoan, {
          where: { employeeId: payslip.employeeId, status: LoanStatus.ACTIVE },
        });

        for (const loan of activeLoans) {
          const repaymentAmount = Number(loan.monthlyDeduction);

          // Create repayment record
          const repayment = manager.create(LoanRepayment, {
            loanId: loan.id,
            payrollRunId: run.id,
            amount: repaymentAmount,
            repaymentDate: new Date().toISOString(),
            status: 'COMPLETED',
          });
          await manager.save(repayment);

          // Update loan balance
          loan.totalRepaid = Number(loan.totalRepaid) + repaymentAmount;
          if (loan.totalRepaid >= Number(loan.principalAmount)) {
            loan.status = LoanStatus.PAID_OFF;
          }
          await manager.save(loan);
        }

        // Handle Advances
        await manager.update(
          AdvanceSalaryRequest,
          {
            employeeId: payslip.employeeId,
            status: AdvanceSalaryStatus.APPROVED,
            deductionPeriod: run.period,
          },
          { status: AdvanceSalaryStatus.DEDUCTED },
        );

        // Handle Bonuses
        await manager.update(
          EmployeeBonus,
          {
            employeeId: payslip.employeeId,
            payrollPeriod: run.period,
            isProcessed: false,
          },
          { isProcessed: true },
        );

        // Handle Arrears
        await manager.update(
          SalaryHistory,
          { employeeId: payslip.employeeId, isProcessedInPayroll: false },
          { isProcessedInPayroll: true },
        );
      }

      run.status = PayrollRunStatus.PROCESSED;
      run.processedAt = new Date();
      await manager.save(run);

      // Audit Log
      await this.logPayrollAudit(
        run.id,
        'FINALIZE',
        { status: PayrollRunStatus.APPROVED },
        { status: run.status },
      );
    });

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

    // Queue distribution job
    await this.payrollQueue.add('distribute-payslips', { runId });

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

  /**
   * Calculates arrears for an employee based on backdated salary revisions.
   */
  async getArrearsForEmployee(
    employeeId: string,
    currentPeriod: string,
  ): Promise<number> {
    const history = await this.salaryHistoryRepo.find({
      where: { employeeId, isProcessedInPayroll: false },
      order: { effectiveDate: 'ASC' },
    });

    let totalArrear = 0;
    const currentPeriodDate = new Date(currentPeriod + '-01');

    for (const record of history) {
      const effectiveDate = new Date(record.effectiveDate);
      if (effectiveDate < currentPeriodDate) {
        // This is a backdated revision. Calculate the diff for months missed.
        // For simplicity: (newSalary - previousSalary) * number of missed months
        const diff = Number(record.newSalary) - Number(record.previousSalary);

        // Count full months between effectiveDate and currentPeriodDate
        const months =
          (currentPeriodDate.getFullYear() - effectiveDate.getFullYear()) * 12 +
          (currentPeriodDate.getMonth() - effectiveDate.getMonth());

        if (months > 0) {
          totalArrear += diff * months;
        }
      }
    }
    return totalArrear;
  }

  /**
   * Generates a bank advice letter for a payroll run.
   */
  async generateBankLetterPdf(runId: string): Promise<Buffer> {
    const run = await this.runRepo.findOne({
      where: { id: runId },
      relations: ['payslips', 'payslips.employee'],
    });
    if (!run) throw new NotFoundException('Payroll run not found');

    const template = `
  <div style="font-family: 'Manrope', sans-serif; padding: 40px; color: #0c1324;">
    <h2 style="text-align: center;">BANK PAYMENT ADVICE</h2>
    <p>To,<br/>The Manager,<br/>Sample Bank Limited,<br/>Main Branch, Dhaka.</p>
    <p><b>Date:</b> {{date}}</p>
    <p><b>Subject:</b> Salary Payment for the period {{period}}</p>
    <p>Dear Sir,</p>
    <p>Please find below the salary details for our employees. We request you to debit our account <b>1234567890123</b> and credit the respective employee accounts as per the table below:</p>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f4f6f8;">
          <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Employee Name</th>
          <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Account Number</th>
          <th style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">Net Amount</th>
        </tr>
      </thead>
      <tbody>
        {{#each employees}}
        <tr>
          <td style="padding: 10px; border: 1px solid #dee2e6;">{{name}}</td>
          <td style="padding: 10px; border: 1px solid #dee2e6;">{{account}}</td>
          <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">{{amount}}</td>
        </tr>
        {{/each}}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background-color: #f4f6f8;">
          <td colspan="2" style="padding: 10px; border: 1px solid #dee2e6;">TOTAL</td>
          <td style="padding: 10px; border: 1px solid #dee2e6; text-align: right;">{{totalNet}}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-top: 50px;">
      <p>Sincerely yours,</p>
      <div style="margin-top: 30px; border-top: 1px solid #000; width: 200px;">
        <p>Authorized Signatory<br/>Nurox ERP Pvt Ltd.</p>
      </div>
    </div>
  </div>
`;

    const data = {
      date: new Date().toLocaleDateString(),
      period: run.period,
      totalNet: run.totalNet,
      employees: run.payslips.map((p) => ({
        name: `${p.employee.firstName} ${p.employee.lastName}`,
        account: p.employee.accountNumber || `${p.employee.employeeId}_ACC`,
        amount: p.netPay,
      })),
    };

    return this.pdfService.generatePdf(template, data);
  }

  /**
* ADVANCE SALARY WORKFLOW
...
   */

  async createAdvanceRequest(dto: any): Promise<AdvanceSalaryRequest> {
    const request = this.advanceRepo.create({
      ...dto,
      status: AdvanceSalaryStatus.PENDING,
      requestedDate: new Date().toISOString(),
    }) as any;
    return this.advanceRepo.save(request);
  }

  async updateAdvanceStatus(
    id: string,
    status: AdvanceSalaryStatus,
    approvedById?: string,
  ): Promise<AdvanceSalaryRequest> {
    const request = await this.advanceRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Advance request not found');

    request.status = status;
    if (approvedById) request.approvedById = approvedById;
    if (status === AdvanceSalaryStatus.DISBURSED) {
      request.disbursedAt = new Date();
    }

    return this.advanceRepo.save(request);
  }

  /**
   * Generates a summary report for a payroll run, grouped by department.
   */
  async getPayrollSummary(runId: string) {
    const payslips = await this.payslipRepo.find({
      where: { payrollRunId: runId },
      relations: ['employee', 'employee.department'],
    });

    const summary = {};

    payslips.forEach((p) => {
      const deptName = p.employee.department?.name || 'Unassigned';
      if (!summary[deptName]) {
        summary[deptName] = {
          count: 0,
          gross: 0,
          deductions: 0,
          net: 0,
          pf: 0,
        };
      }

      summary[deptName].count++;
      summary[deptName].gross += Number(p.grossPay);
      summary[deptName].deductions += Number(p.totalDeductions);
      summary[deptName].net += Number(p.netPay);
      summary[deptName].pf += Number(p.employerPfContribution);
    });

    return summary;
  }

  async approveOvertime(attendanceId: string, approvedById: string) {
    const record = await this.attendanceRepo.findOne({
      where: { id: attendanceId },
    });
    if (!record) throw new NotFoundException('Attendance record not found');

    record.isOvertimeApproved = true;
    record.overtimeApprovedById = approvedById;
    return this.attendanceRepo.save(record);
  }

  /**
   * Generates a generic bank transfer CSV file.
   */
  async generateBankTransferFile(runId: string): Promise<string> {
    const payslips = await this.payslipRepo.find({
      where: { payrollRunId: runId },
      relations: ['employee', 'payrollRun'],
    });

    let csv = 'Account Number,Account Name,Amount,Reference\n';

    for (const p of payslips) {
      const name = `${p.employee.firstName} ${p.employee.lastName}`;
      const acc = p.employee.accountNumber || 'N/A';
      csv += `${acc},"${name}",${p.netPay},Salary ${p.payrollRun?.period || ''}\n`;
    }

    return csv;
  }

  /**
   * Compares two payroll runs and returns variances per component.
   */
  async getPayrollComparison(currentRunId: string, previousRunId: string) {
    const [currentRun, previousRun] = await Promise.all([
      this.payslipRepo.find({
        where: { payrollRunId: currentRunId },
        relations: ['employee'],
      }),
      this.payslipRepo.find({
        where: { payrollRunId: previousRunId },
        relations: ['employee'],
      }),
    ]);

    const comparison: any[] = [];

    currentRun.forEach((curr) => {
      const prev = previousRun.find((p) => p.employeeId === curr.employeeId);
      comparison.push({
        employeeName: `${curr.employee.firstName} ${curr.employee.lastName}`,
        currentNet: curr.netPay,
        previousNet: prev ? prev.netPay : 0,
        variance: prev
          ? Number(curr.netPay) - Number(prev.netPay)
          : Number(curr.netPay),
      });
    });

    return comparison;
  }
}
