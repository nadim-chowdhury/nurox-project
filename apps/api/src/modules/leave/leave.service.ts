import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LeaveRequest,
  LeaveBalance,
  LeaveRequestStatus,
  LeaveType,
} from './entities/leave.entity';
import { CompensatoryLeave } from './entities/comp-leave.entity';
import { Employee } from '../hr/entities/employee.entity';
import { NotificationService } from '../system/notification.service';
import { NotificationType } from '../system/entities/notification.entity';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private readonly balanceRepo: Repository<LeaveBalance>,
    @InjectRepository(CompensatoryLeave)
    private readonly compLeaveRepo: Repository<CompensatoryLeave>,
    private readonly notificationService: NotificationService,
    private readonly cls: ClsService,
  ) {}

  private get tenantId(): string {
    return this.cls.get('tenantId');
  }

  private get fiscalYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    // Assuming April 1st start of fiscal year
    return today.getMonth() >= 3
      ? `${year}-${(year + 1).toString().slice(-2)}`
      : `${year - 1}-${year.toString().slice(-2)}`;
  }

  async applyLeave(dto: any) {
    const employee = await this.leaveRepo.manager.findOne(Employee, {
      where: { id: dto.employeeId, tenantId: this.tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    // Check balance first
    let balance = await this.balanceRepo.findOne({
      where: {
        employeeId: dto.employeeId,
        leaveType: dto.leaveType,
        fiscalYear: this.fiscalYear,
        tenantId: this.tenantId,
      },
    });

    if (!balance) {
      // Auto-create pro-rated balance if missing
      balance = await this.createProRatedBalance(employee, dto.leaveType);
    }

    if (Number(balance.totalDays) - Number(balance.usedDays) < dto.totalDays) {
      throw new ConflictException('Insufficient leave balance');
    }

    // Clash detection
    const clashes = await this.checkClash(
      dto.employeeId,
      dto.startDate,
      dto.endDate,
    );
    if (clashes.length >= 5) {
      // Increased threshold for larger teams
      throw new ConflictException(
        `Too many team members on leave during this period (${clashes.length} already approved)`,
      );
    }

    const request = this.leaveRepo.create({
      ...dto,
      tenantId: this.tenantId,
      status: LeaveRequestStatus.PENDING,
    });
    return this.leaveRepo.save(request);
  }

  private async createProRatedBalance(
    employee: Employee,
    leaveType: LeaveType,
  ): Promise<LeaveBalance> {
    const joinDate = new Date(employee.joinDate);
    const monthsWorked = 12 - joinDate.getMonth();

    let totalDays = 0;
    switch (leaveType) {
      case LeaveType.ANNUAL:
        totalDays = Math.round((20 / 12) * monthsWorked);
        break;
      case LeaveType.CASUAL:
        totalDays = Math.round((10 / 12) * monthsWorked);
        break;
      case LeaveType.SICK:
        totalDays = 10;
        break;
      default:
        totalDays = 0;
    }

    const balance = this.balanceRepo.create({
      tenantId: this.tenantId,
      employeeId: employee.id,
      leaveType,
      totalDays,
      usedDays: 0,
      fiscalYear: this.fiscalYear,
    });
    return this.balanceRepo.save(balance);
  }

  async initializeBalances(employeeId: string) {
    const employee = await this.leaveRepo.manager.findOne(Employee, {
      where: { id: employeeId, tenantId: this.tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const leaveTypes = [LeaveType.ANNUAL, LeaveType.CASUAL, LeaveType.SICK];
    const balances: LeaveBalance[] = [];

    for (const type of leaveTypes) {
      const existing = await this.balanceRepo.findOne({
        where: {
          employeeId,
          leaveType: type,
          fiscalYear: this.fiscalYear,
          tenantId: this.tenantId,
        },
      });

      if (!existing) {
        balances.push(await this.createProRatedBalance(employee, type));
      }
    }

    return balances;
  }

  async approveLeave(
    id: string,
    approvedById: string,
    status: LeaveRequestStatus,
    comment?: string,
  ) {
    const request = await this.leaveRepo.findOne({
      where: { id, tenantId: this.tenantId },
      relations: ['employee'],
    });
    if (!request) throw new NotFoundException('Leave request not found');

    request.status = status;
    request.approvedById = approvedById;
    request.comments = comment || null;

    if (status === LeaveRequestStatus.APPROVED) {
      // Deduct from balance
      const balance = await this.balanceRepo.findOne({
        where: {
          employeeId: request.employeeId,
          leaveType: request.leaveType,
          fiscalYear: this.fiscalYear,
          tenantId: this.tenantId,
        },
      });
      if (balance) {
        balance.usedDays = Number(balance.usedDays) + Number(request.totalDays);
        await this.balanceRepo.save(balance);
      }
    }

    const result = await this.leaveRepo.save(request);

    // Notify employee
    if (request.employee?.userId) {
      await this.notificationService.create({
        tenantId: this.tenantId,
        userId: request.employee.userId,
        title: `Leave Request ${status.toLowerCase()}`,
        message: `Your leave request for ${request.startDate} to ${request.endDate} has been ${status.toLowerCase()}.`,
        type: NotificationType.HR,
      });
    }

    return result;
  }

  async getLeaveBalances(employeeId: string) {
    return this.balanceRepo.find({
      where: {
        employeeId,
        tenantId: this.tenantId,
        fiscalYear: this.fiscalYear,
      },
    });
  }

  async findAllLeaveRequests() {
    return this.leaveRepo.find({
      where: { tenantId: this.tenantId },
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEncashableLeaveDays(
    employeeId: string,
    fiscalYear: string,
  ): Promise<number> {
    const balance = await this.balanceRepo.findOne({
      where: {
        employeeId,
        leaveType: LeaveType.ANNUAL,
        fiscalYear,
        tenantId: this.tenantId,
      },
    });
    if (!balance) return 0;
    const remaining = Number(balance.totalDays) - Number(balance.usedDays);
    return Math.min(Math.max(0, remaining - 10), 20);
  }

  async grantCompensatoryLeave(
    employeeId: string,
    days: number,
    expiryDate: string,
    reason: string,
  ) {
    const grant = this.compLeaveRepo.create({
      tenantId: this.tenantId,
      employeeId,
      daysGranted: days,
      expiryDate,
      reason,
    });

    let balance = await this.balanceRepo.findOne({
      where: {
        employeeId,
        leaveType: LeaveType.COMPENSATORY,
        fiscalYear: this.fiscalYear,
        tenantId: this.tenantId,
      },
    });

    if (!balance) {
      balance = this.balanceRepo.create({
        tenantId: this.tenantId,
        employeeId,
        leaveType: LeaveType.COMPENSATORY,
        totalDays: days,
        usedDays: 0,
        fiscalYear: this.fiscalYear,
      });
    } else {
      balance.totalDays = Number(balance.totalDays) + days;
    }

    await this.balanceRepo.save(balance);
    return this.compLeaveRepo.save(grant);
  }

  async checkClash(
    employeeId: string,
    start: string,
    end: string,
  ): Promise<any[]> {
    return this.leaveRepo
      .createQueryBuilder('leave')
      .where('leave.tenantId = :tenantId', { tenantId: this.tenantId })
      .andWhere('leave.employeeId != :empId', { empId: employeeId })
      .andWhere('leave.status = :status', {
        status: LeaveRequestStatus.APPROVED,
      })
      .andWhere('(leave.startDate <= :end AND leave.endDate >= :start)', {
        start,
        end,
      })
      .getMany();
  }
}
