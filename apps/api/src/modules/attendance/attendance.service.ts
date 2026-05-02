import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  AttendanceRecord,
  AttendanceMethod,
  AttendanceStatus,
} from './entities/attendance.entity';
import {
  RegularizationRequest,
  RegularizationStatus,
} from './entities/regularization.entity';
import {
  ShiftAssignment,
  ShiftRotation,
} from './entities/shift-assignment.entity';
import { Shift } from '../hr/entities/shift.entity';
import { Employee } from '../hr/entities/employee.entity';
import { Holiday } from './entities/holiday.entity';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRepo: Repository<AttendanceRecord>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Holiday)
    private readonly holidayRepo: Repository<Holiday>,
    @InjectRepository(RegularizationRequest)
    private readonly regularizationRepo: Repository<RegularizationRequest>,
    @InjectRepository(ShiftAssignment)
    private readonly shiftAssignmentRepo: Repository<ShiftAssignment>,
    @InjectRepository(ShiftRotation)
    private readonly shiftRotationRepo: Repository<ShiftRotation>,
    private readonly jwtService: JwtService,
  ) {}

  async generateCheckInQr(employeeId: string): Promise<string> {
    const payload = { sub: employeeId, purpose: 'attendance_qr' };
    return this.jwtService.sign(payload, { expiresIn: '30m' });
  }

  async checkInViaQr(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (payload.purpose !== 'attendance_qr') {
        throw new ConflictException('Invalid QR token');
      }
      return this.recordAttendance(payload.sub, AttendanceMethod.QR, 'IN');
    } catch (err) {
      throw new ConflictException('QR token expired or invalid');
    }
  }

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
      relations: ['shift', 'department'],
    });

    if (!employee) throw new NotFoundException('Employee not found');

    // Check if today is a public holiday
    const holiday = await this.holidayRepo.findOne({
      where: [
        { date: today, branchId: (employee.department as any)?.branchId },
        { date: today, branchId: null },
      ],
    });

    if (holiday && type === 'IN') {
      this.logger.log(
        `Employee ${employeeId} checking in on holiday: ${holiday.name}`,
      );
    }

    if (method === AttendanceMethod.GEO_FENCED && location) {
      const officeCoords = { lat: 23.8103, lng: 90.4125 };
      const distance = this.getDistance(
        location.lat,
        location.lng,
        officeCoords.lat,
        officeCoords.lng,
      );
      if (distance > 200) {
        throw new ConflictException(
          `You are ${Math.round(distance)}m away from the office. Check-in not allowed.`,
        );
      }
    }

    // IP-based validation placeholder
    const allowedIps = ['127.0.0.1', '::1']; // Example
    // In real app, get client IP from request context
    const clientIp = '127.0.0.1';
    if (method === AttendanceMethod.QR && !allowedIps.includes(clientIp)) {
      this.logger.warn(`Check-in attempted from unauthorized IP: ${clientIp}`);
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
          location: location as any,
          checkIn: now,
          status: AttendanceStatus.PRESENT,
        });
      } else {
        record.checkIn = now;
        record.method = method;
        record.location = location as any;
      }

      if (employee.shift) {
        const shiftStart = new Date(`${today}T${employee.shift.startTime}:00`);
        const graceEnd = new Date(
          shiftStart.getTime() +
            (employee.shift.gracePeriodMinutes || 15) * 60000,
        );
        const halfDayCutoff = employee.shift.halfDayCutoffTime
          ? new Date(`${today}T${employee.shift.halfDayCutoffTime}:00`)
          : null;

        if (halfDayCutoff && now > halfDayCutoff) {
          record.status = AttendanceStatus.HALF_DAY;
        } else if (now > graceEnd) {
          record.status = AttendanceStatus.LATE;
        }
      }
    } else {
      if (!record || !record.checkIn)
        throw new ConflictException('No check-in record found for today');

      const now = timestamp || new Date();
      record.checkOut = now;
      record.location = location as any;

      if (employee.shift) {
        const shiftEnd = new Date(`${today}T${employee.shift.endTime}:00`);
        const earlyAllowance =
          shiftEnd.getTime() -
          (employee.shift.earlyDepartureAllowance || 0) * 60000;

        if (now.getTime() < earlyAllowance) {
          // If already late/half-day, keep that status or combine?
          // Usually, early exit is a penalty too.
          if (record.status === AttendanceStatus.PRESENT) {
            record.status = AttendanceStatus.EARLY_EXIT;
          }
        }

        // Calculate overtime if check-out is after shift end
        if (now > shiftEnd) {
          const diffMs = now.getTime() - shiftEnd.getTime();
          record.overtimeMinutes = Math.floor(diffMs / 60000);
          record.isOvertime = record.overtimeMinutes > 30;
        }
      }
    }

    return this.attendanceRepo.save(record);
  }

  async createRegularization(dto: any): Promise<RegularizationRequest> {
    const request = this.regularizationRepo.create({
      ...dto,
      status: RegularizationStatus.PENDING,
    }) as any as RegularizationRequest;
    return this.regularizationRepo.save(request);
  }

  async approveRegularization(
    id: string,
    approvedById: string,
    status: RegularizationStatus,
  ) {
    const request = await this.regularizationRepo.findOne({
      where: { id },
      relations: ['employee'],
    });
    if (!request)
      throw new NotFoundException('Regularization request not found');

    request.status = status;
    request.approvedById = approvedById;
    request.approvedAt = new Date();

    const saved = await this.regularizationRepo.save(request);

    if (status === RegularizationStatus.APPROVED) {
      // Correct the attendance record
      await this.recordAttendance(
        request.employeeId,
        AttendanceMethod.MANUAL,
        'IN',
        undefined,
        request.checkIn,
      );
      await this.recordAttendance(
        request.employeeId,
        AttendanceMethod.MANUAL,
        'OUT',
        undefined,
        request.checkOut,
      );
    }

    return saved;
  }

  async manualHrEntry(
    employeeId: string,
    date: string,
    checkIn?: Date,
    checkOut?: Date,
    reason?: string,
  ) {
    let record = await this.attendanceRepo.findOne({
      where: { employeeId, date },
    });

    if (!record) {
      record = this.attendanceRepo.create({
        employeeId,
        date,
        checkIn,
        checkOut,
        method: AttendanceMethod.MANUAL,
        remarks: reason || null,
        status: AttendanceStatus.PRESENT,
      });
    } else {
      if (checkIn) record.checkIn = checkIn;
      if (checkOut) record.checkOut = checkOut;
      record.remarks = reason || null;
    }

    return this.attendanceRepo.save(record);
  }

  async assignShift(employeeId: string, shiftId: string, startDate: string) {
    // Deactivate current active shift
    await this.shiftAssignmentRepo.update(
      { employeeId, isActive: true },
      { isActive: false, endDate: startDate },
    );

    const assignment = this.shiftAssignmentRepo.create({
      employeeId,
      shiftId,
      startDate,
      isActive: true,
    });
    return this.shiftAssignmentRepo.save(assignment);
  }

  async getEmployeeShift(
    employeeId: string,
    _date: string,
  ): Promise<Shift | null> {
    const assignment = await this.shiftAssignmentRepo.findOne({
      where: {
        employeeId,
        isActive: true,
        // In a real app, logic would check if date is within startDate and endDate
      },
      relations: ['shift'],
    });

    return assignment?.shift || null;
  }

  async getTeamAttendance(date: string) {
    return this.attendanceRepo.find({
      where: { date },
      relations: ['employee'],
    });
  }

  async bulkImport(records: any[]) {
    const entities = this.attendanceRepo.create(records);
    return this.attendanceRepo.save(entities);
  }

  async generateMonthlyReport(month: number, year: number, res: Response) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const records = await this.attendanceRepo.find({
      where: { date: Between(startDate, endDate) },
      relations: ['employee'],
      order: { date: 'ASC' },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Employee ID', key: 'empId', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Check In', key: 'in', width: 20 },
      { header: 'Check Out', key: 'out', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'OT (Mins)', key: 'ot', width: 10 },
    ];

    records.forEach((r) => {
      sheet.addRow({
        date: r.date,
        empId: r.employee.employeeId,
        name: `${r.employee.firstName} ${r.employee.lastName}`,
        in: r.checkIn,
        out: r.checkOut,
        status: r.status,
        ot: r.overtimeMinutes,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=attendance-${month}-${year}.xlsx`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  async getAnalytics(month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const records = await this.attendanceRepo.find({
      where: { date: Between(startDate, endDate) },
    });

    const totalPossibleDays = records.length; // Simplified
    const lateCount = records.filter(
      (r) => r.status === AttendanceStatus.LATE,
    ).length;
    const absentCount = records.filter(
      (r) => r.status === AttendanceStatus.ABSENT,
    ).length;
    const halfDayCount = records.filter(
      (r) => r.status === AttendanceStatus.HALF_DAY,
    ).length;

    return {
      absenteeismRate: totalPossibleDays
        ? (absentCount / totalPossibleDays) * 100
        : 0,
      lateRate: totalPossibleDays ? (lateCount / totalPossibleDays) * 100 : 0,
      trends: {
        late: lateCount,
        absent: absentCount,
        halfDay: halfDayCount,
      },
    };
  }

  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  }
}
