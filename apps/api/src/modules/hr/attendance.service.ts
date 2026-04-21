import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AttendanceRecord, AttendanceStatus, AttendanceMethod } from './entities/attendance.entity';
import { LeaveRequest, LeaveBalance, LeaveRequestStatus, LeaveType } from './entities/leave.entity';
import { Shift } from './entities/shift.entity';
import { Employee } from './entities/employee.entity';
import { JwtService } from '@nestjs/jwt';

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
    private readonly jwtService: JwtService,
  ) {}

  // ─── ATTENDANCE ─────────────────────────────────────────────

  /**
   * Generates a signed QR code for an employee to scan at the entrance.
   */
  async generateCheckInQr(employeeId: string): Promise<string> {
    const payload = { sub: employeeId, type: 'attendance_qr', timestamp: Date.now() };
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
    location?: { lat: number; lng: number; address?: string }
  ) {
    const today = new Date().toISOString().split('T')[0];
    let record = await this.attendanceRepo.findOne({ where: { employeeId, date: today } });

    if (type === 'IN') {
      if (record && record.checkIn) throw new ConflictException('Already checked in today');
      
      if (!record) {
        record = this.attendanceRepo.create({
          employeeId,
          date: today,
          method,
          location,
          checkIn: new Date(),
          status: AttendanceStatus.PRESENT,
        });
      } else {
        record.checkIn = new Date();
        record.method = method;
        record.location = location;
      }
      
      // Auto-flag LATE if past shift start + grace period (Logic simplified for demo)
      // In production, fetch employee's shift and compare HH:mm
    } else {
      if (!record || !record.checkIn) throw new ConflictException('No check-in record found for today');
      if (record.checkOut) throw new ConflictException('Already checked out today');

      record.checkOut = new Date();
      
      // Calculate Overtime (Example: if working > 9 hours)
      const diffMs = record.checkOut.getTime() - record.checkIn.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      if (diffHrs > 9) {
        record.isOvertime = true;
        record.overtimeMinutes = Math.floor((diffHrs - 9) * 60);
      }
    }

    return this.attendanceRepo.save(record);
  }

  // ─── LEAVE MANAGEMENT ────────────────────────────────────────

  async applyLeave(dto: any): Promise<LeaveRequest> {
    const { employeeId, leaveType, startDate, endDate, reason } = dto;
    
    // Check balance
    const balance = await this.leaveBalanceRepo.findOne({ 
      where: { employeeId, leaveType, fiscalYear: '2025-26' } 
    });
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (!balance || (balance.totalDays - balance.usedDays) < totalDays) {
      throw new ConflictException('Insufficient leave balance');
    }

    // Check for clashes (already applied leave in same period)
    const clash = await this.leaveRequestRepo.findOne({
      where: [
        { employeeId, startDate: Between(startDate, endDate), status: MoreThanOrEqual(LeaveRequestStatus.PENDING) as any },
        { employeeId, endDate: Between(startDate, endDate), status: MoreThanOrEqual(LeaveRequestStatus.PENDING) as any },
      ]
    });
    if (clash) throw new ConflictException('Leave already applied for this period');

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

  async approveLeave(requestId: string, approvedById: string, status: LeaveRequestStatus) {
    const request = await this.leaveRequestRepo.findOne({ where: { id: requestId }, relations: ['employee'] });
    if (!request) throw new NotFoundException('Leave request not found');

    if (status === LeaveRequestStatus.APPROVED) {
      // Update balance
      const balance = await this.leaveBalanceRepo.findOne({ 
        where: { employeeId: request.employeeId, leaveType: request.leaveType, fiscalYear: '2025-26' } 
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

  async getTeamAttendance(date: string) {
    return this.attendanceRepo.find({
      where: { date },
      relations: ['employee', 'employee.department'],
    });
  }
}
