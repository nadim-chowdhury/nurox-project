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
  ) {}

  async applyLeave(dto: any) {
    const employee = await this.leaveRepo.manager.findOne(Employee, {
      where: { id: dto.employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    // Check balance first
    let balance = await this.balanceRepo.findOne({
      where: {
        employeeId: dto.employeeId,
        leaveType: dto.leaveType,
        fiscalYear: '2025-26',
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
    if (clashes.length >= 3) {
      throw new ConflictException(
        `Too many team members on leave during this period (${clashes.length} already approved)`,
      );
    }

    const request = this.leaveRepo.create({
      ...dto,
      status: LeaveRequestStatus.PENDING,
    });
    return this.leaveRepo.save(request);
  }

  private async createProRatedBalance(
    employee: Employee,
    leaveType: LeaveType,
  ): Promise<LeaveBalance> {
    const joinDate = new Date(employee.joinDate);
    const yearEnd = new Date(joinDate.getFullYear(), 11, 31);
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
        break; // Sick leave usually not pro-rated
      default:
        totalDays = 0;
    }

    const balance = this.balanceRepo.create({
      employeeId: employee.id,
      leaveType,
      totalDays,
      usedDays: 0,
      fiscalYear: '2025-26',
    });
    return this.balanceRepo.save(balance);
  }

  async approveLeave(
    id: string,
    approvedById: string,
    status: LeaveRequestStatus,
    comment?: string,
  ) {
    const request = await this.leaveRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!request) throw new NotFoundException('Leave request not found');

    // Multi-level logic: Manager -> HR
    // If status is APPROVED and current user is manager, maybe move to APPROVED_BY_MANAGER
    // For this prototype, let's assume if status is APPROVED, it's final.

    request.status = status;
    request.approvedById = approvedById;
    request.comments = comment || null;

    if (status === LeaveRequestStatus.APPROVED) {
      // Deduct from balance
      const balance = await this.balanceRepo.findOne({
        where: {
          employeeId: request.employeeId,
          leaveType: request.leaveType,
          fiscalYear: '2025-26',
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
        tenantId:
          (request.employee as any).tenantId || (request as any).tenantId,
        userId: request.employee.userId,
        title: `Leave Request ${status.toLowerCase()}`,
        message: `Your leave request for ${request.startDate} to ${request.endDate} has been ${status.toLowerCase()}.`,
        type: NotificationType.HR,
      });
    }

    return result;
  }

  async getLeaveBalances(employeeId: string) {
    return this.balanceRepo.find({ where: { employeeId } });
  }

  async findAllLeaveRequests() {
    return this.leaveRepo.find({
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEncashableLeaveDays(
    employeeId: string,
    fiscalYear: string,
  ): Promise<number> {
    const balance = await this.balanceRepo.findOne({
      where: { employeeId, leaveType: LeaveType.ANNUAL, fiscalYear },
    });
    // Encash anything above 10 days, max 20 days
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
      employeeId,
      daysGranted: days,
      expiryDate,
      reason,
    });

    // Also update/create leave balance for COMPENSATORY type
    let balance = await this.balanceRepo.findOne({
      where: {
        employeeId,
        leaveType: LeaveType.COMPENSATORY,
        fiscalYear: '2025-26',
      },
    });

    if (!balance) {
      balance = this.balanceRepo.create({
        employeeId,
        leaveType: LeaveType.COMPENSATORY,
        totalDays: days,
        usedDays: 0,
        fiscalYear: '2025-26',
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
      .leftJoinAndSelect('leave.employee', 'employee')
      .where('leave.employeeId != :empId', { empId: employeeId })
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
