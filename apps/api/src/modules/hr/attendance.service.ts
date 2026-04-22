import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceMethod,
} from './entities/attendance.entity';
import {
  LeaveRequest,
  LeaveBalance,
  LeaveRequestStatus,
  LeaveType,
} from './entities/leave.entity';
import { Shift } from './entities/shift.entity';
import { Employee } from './entities/employee.entity';
import { Holiday } from './entities/holiday.entity';
import { JwtService } from '@nestjs/jwt';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepo: Repository<LeaveRequest>,
    @InjectRepository(LeaveBalance)
    private readonly leaveBalanceRepo: Repository<LeaveBalance>,
    @InjectRepository(Shift)
    private readonly shiftRepo: Repository<Shift>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,
    private readonly jwtService: JwtService,
  ) {}

  // ─── ATTENDANCE ─────────────────────────────────────────────

  /**
   * Generates a signed QR code for an employee to scan at the entrance.
   */
  async generateCheckInQr(employeeId: string): Promise<string> {
    const payload = {
      sub: employeeId,
      type: 'attendance_qr',
      timestamp: Date.now(),
    };
    return this.jwtService.sign(payload, { expiresIn: '1m' });
  }

  /**
   * Verifies a scanned QR code and records check-in.
   */
  async checkInViaQr(employeeId: string, token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.sub !== employeeId || payload.type !== 'attendance_qr') {
        throw new ConflictException('Invalid QR code');
      }

      return this.recordAttendance(employeeId, AttendanceMethod.QR, 'IN');
    } catch (e) {
      throw new ConflictException('QR code expired or invalid');
    }
  }

  /**
   * Records attendance (IN or OUT) and calculates status/overtime.
   */
  async recordAttendance(
    employeeId: string,
    method: AttendanceMethod,
    type: 'IN' | 'OUT',
    location?: { lat: number; lng: number; address?: string },
    timestamp?: Date,
  ) {
    const today = (timestamp || new Date()).toISOString().split('T')[0];
    let record = await this.attendanceRepo.findOne({
      where: { employeeId, date: today },
    });

    const employee = await this.employeeRepo.findOne({
        where: { id: employeeId },
        relations: ['shift'],
    });

    if (!employee) throw new NotFoundException('Employee not found');

    // Check if today is a public holiday
    const holiday = await this.holidayRepo.findOne({
        where: [
            { date: today, branchId: employee.department?.branchId as any },
            { date: today, branchId: null },
        ]
    });

    if (holiday && type === 'IN') {
        this.logger.log(`Employee ${employeeId} checking in on holiday: ${holiday.name}`);
        // Maybe auto-flag as overtime or just log
    }

    if (method === AttendanceMethod.GEO_FENCED && location) {
        // Simple geo-fence validation (e.g., must be within 200m of office)
        const officeCoords = { lat: 23.8103, lng: 90.4125 }; // Mock office coordinates
        const distance = this.getDistance(location.lat, location.lng, officeCoords.lat, officeCoords.lng);
        if (distance > 200) {
            throw new ConflictException(`You are ${Math.round(distance)}m away from the office. Check-in not allowed.`);
        }
    }

    if (type === 'IN') {
      if (record && record.checkIn)
        throw new ConflictException('Already checked in today');

      const now = timestamp || new Date();
      if (!record) {
        record = this.attendanceRepo.create({
          employeeId,
          date: today,
          method,
          location,
          checkIn: now,
          status: AttendanceStatus.PRESENT,
        });
      } else {
        record.checkIn = now;
        record.method = method;
        record.location = location;
      }

      // Late flagging logic
      if (employee.shift) {
          const shiftStart = new Date(`${today}T${employee.shift.startTime}:00`);
          const graceEnd = new Date(shiftStart.getTime() + (employee.shift.gracePeriodMinutes || 15) * 60000);
          if (now > graceEnd) {
              record.status = AttendanceStatus.LATE;
          }
      }
    } else {
      if (!record || !record.checkIn)
        throw new ConflictException('No check-in record found for today');
      if (record.checkOut)
        throw new ConflictException('Already checked out today');

      const now = timestamp || new Date();
      record.checkOut = now;

      // Calculate Overtime
      if (employee.shift) {
          const shiftEnd = new Date(`${today}T${employee.shift.endTime}:00`);
          // Handle night shifts where shiftEnd is next day
          if (shiftEnd < record.checkIn) shiftEnd.setDate(shiftEnd.getDate() + 1);

          const diffMs = now.getTime() - shiftEnd.getTime();
          const diffMins = Math.floor(diffMs / (1000 * 60));

          if (diffMins > 0) {
              record.isOvertime = true;
              record.overtimeMinutes = diffMins;
          }
      } else {
          // Default 9h logic if no shift assigned
          const diffMs = record.checkOut.getTime() - record.checkIn.getTime();
          const diffHrs = diffMs / (1000 * 60 * 60);
          if (diffHrs > 9) {
            record.isOvertime = true;
            record.overtimeMinutes = Math.floor((diffHrs - 9) * 60);
          }
      }
    }

    return this.attendanceRepo.save(record);
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // ─── LEAVE MANAGEMENT ────────────────────────────────────────

  async applyLeave(dto: any): Promise<LeaveRequest> {
    const { employeeId, leaveType, startDate, endDate, reason } = dto;

    // Check balance
    const balance = await this.leaveBalanceRepo.findOne({
      where: { employeeId, leaveType, fiscalYear: '2025-26' },
    });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (!balance || balance.totalDays - balance.usedDays < totalDays) {
      throw new ConflictException('Insufficient leave balance');
    }

    // Check for clashes (already applied leave in same period)
    const clash = await this.leaveRequestRepo.findOne({
      where: [
        {
          employeeId,
          startDate: Between(startDate, endDate),
          status: MoreThanOrEqual(LeaveRequestStatus.PENDING) as any,
        },
        {
          employeeId,
          endDate: Between(startDate, endDate),
          status: MoreThanOrEqual(LeaveRequestStatus.PENDING) as any,
        },
      ],
    });
    if (clash)
      throw new ConflictException('Leave already applied for this period');

    const request = this.leaveRequestRepo.create({
      employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      status: LeaveRequestStatus.PENDING,
    });

    return this.leaveRequestRepo.save(request);
  }

  /**
   * Auto-escalate leaves if manager is on leave or hasn't responded.
   */
  async escalatePendingLeaves() {
      const pendingLeaves = await this.leaveRequestRepo.find({
          where: { status: LeaveRequestStatus.PENDING },
          relations: ['employee', 'employee.manager'],
      });

      const now = new Date();
      for (const leave of pendingLeaves) {
          const appliedDate = new Date(leave.createdAt);
          const hoursDiff = (now.getTime() - appliedDate.getTime()) / (1000 * 60 * 60);

          // If manager hasn't responded in 24 hours, or manager is currently on leave
          if (hoursDiff > 24) {
              this.logger.log(`Escalating leave request ${leave.id} to HR due to inactivity`);
              // Logic to notify HR or move to next level
          }

          if (leave.employee?.managerId) {
              const managerOnLeave = await this.leaveRequestRepo.findOne({
                  where: {
                      employeeId: leave.employee.managerId,
                      status: LeaveRequestStatus.APPROVED,
                      startDate: LessThanOrEqual(now.toISOString()),
                      endDate: MoreThanOrEqual(now.toISOString()),
                  }
              });

              if (managerOnLeave) {
                  this.logger.log(`Manager ${leave.employee.managerId} is on leave. Auto-delegating request ${leave.id}`);
                  // Logic to delegate to second-level manager or HR
              }
          }
      }
  }

  async approveLeave(
    requestId: string,
    approvedById: string,
    status: LeaveRequestStatus,
  ) {
    const request = await this.leaveRequestRepo.findOne({
      where: { id: requestId },
      relations: ['employee'],
    });
    if (!request) throw new NotFoundException('Leave request not found');

    if (status === LeaveRequestStatus.APPROVED) {
      // Update balance
      const balance = await this.leaveBalanceRepo.findOne({
        where: {
          employeeId: request.employeeId,
          leaveType: request.leaveType,
          fiscalYear: '2025-26',
        },
      });
      if (balance) {
        balance.usedDays = Number(balance.usedDays) + Number(request.totalDays);
        await this.leaveBalanceRepo.save(balance);
      }
    }

    request.status = status;
    request.approvedById = approvedById;
    return this.leaveRequestRepo.save(request);
  }

  async getLeaveBalances(employeeId: string): Promise<LeaveBalance[]> {
    return this.leaveBalanceRepo.find({ where: { employeeId } });
  }

  /**
   * Calculates the number of leave days that can be encashed.
   * Typically done at the end of a fiscal year or as per company policy.
   */
  async getEncashableLeaveDays(employeeId: string, fiscalYear: string): Promise<number> {
      const annualLeaveBalance = await this.leaveBalanceRepo.findOne({
          where: { employeeId, leaveType: LeaveType.ANNUAL, fiscalYear }
      });

      if (!annualLeaveBalance) return 0;

      const remaining = Number(annualLeaveBalance.totalDays) - Number(annualLeaveBalance.usedDays);
      // Example policy: only ANNUAL leaves can be encashed, up to a certain limit or all
      return Math.max(0, remaining);
  }

  async findAllLeaveRequests() {
      return this.leaveRequestRepo.find({
          relations: ['employee'],
          order: { createdAt: 'DESC' },
      });
  }

  async getTeamAttendance(date: string) {
    return this.attendanceRepo.find({
      where: { date },
      relations: ['employee', 'employee.department'],
    });
  }

  async bulkImport(records: any[]) {
      const entities = records.map(r => this.attendanceRepo.create(r));
      return this.attendanceRepo.save(entities);
  }

  /**
   * Processes carry-forward and balance reset at the end of a fiscal year.
   */
  async processFiscalYearEnd(currentYear: string, nextYear: string, maxCarryForwardDays: number = 10) {
      const balances = await this.leaveBalanceRepo.find({
          where: { fiscalYear: currentYear }
      });

      for (const balance of balances) {
          const remaining = Number(balance.totalDays) - Number(balance.usedDays);
          const carryForward = Math.min(remaining, maxCarryForwardDays);

          const newBalance = this.leaveBalanceRepo.create({
              employeeId: balance.employeeId,
              leaveType: balance.leaveType,
              totalDays: 15, // Default for next year, should be configurable
              usedDays: 0,
              carriedForwardDays: carryForward,
              fiscalYear: nextYear,
              expiryDate: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0], // End of next year
          });

          await this.leaveBalanceRepo.save(newBalance);
      }
  }

  async generateMonthlyReport(month: number, year: number, res: Response) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const records = await this.attendanceRepo.find({
          where: {
              date: Between(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]),
          },
          relations: ['employee'],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendance Report');

      worksheet.columns = [
          { header: 'Employee', key: 'employee', width: 20 },
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Check In', key: 'checkIn', width: 20 },
          { header: 'Check Out', key: 'checkOut', width: 20 },
          { header: 'Status', key: 'status', width: 12 },
          { header: 'Overtime (mins)', key: 'overtime', width: 15 },
      ];

      records.forEach(r => {
          worksheet.addRow({
              employee: `${r.employee?.firstName} ${r.employee?.lastName}`,
              date: r.date,
              checkIn: r.checkIn?.toISOString(),
              checkOut: r.checkOut?.toISOString(),
              status: r.status,
              overtime: r.overtimeMinutes,
          });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=attendance-${year}-${month}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
  }
}
