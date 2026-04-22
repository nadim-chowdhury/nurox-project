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
import { NotificationService } from '../system/notification.service';
import { NotificationType } from '../system/entities/notification.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private readonly balanceRepo: Repository<LeaveBalance>,
    private readonly notificationService: NotificationService,
  ) {}

  async applyLeave(dto: any) {
    // Check balance first
    const balance = await this.balanceRepo.findOne({
      where: {
        employeeId: dto.employeeId,
        leaveType: dto.leaveType,
        fiscalYear: '2025-26',
      },
    });

    if (
      !balance ||
      Number(balance.totalDays) - Number(balance.usedDays) < dto.totalDays
    ) {
      throw new ConflictException('Insufficient leave balance');
    }

    const request = this.leaveRepo.create({
      ...dto,
      status: LeaveRequestStatus.PENDING,
    });
    return this.leaveRepo.save(request);
  }

  async approveLeave(
    id: string,
    approvedById: string,
    status: LeaveRequestStatus,
  ) {
    const request = await this.leaveRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!request) throw new NotFoundException('Leave request not found');

    request.status = status;
    request.approvedById = approvedById;

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
        tenantId: (request.employee as any).tenantId || (request as any).tenantId,
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
}
