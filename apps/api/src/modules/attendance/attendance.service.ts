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
import { Employee } from '../hr/entities/employee.entity';
import { Holiday } from './entities/holiday.entity';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import * as crypto from 'crypto';

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
  ) {}

  async generateCheckInQr(_employeeId: string): Promise<string> {
    // In a real app, generate a signed, time-limited token
    const token = crypto.randomBytes(32).toString('hex');
    // Store in Redis with TTL
    return token;
  }

  async checkInViaQr(employeeId: string, _token: string) {
    // Validate token from Redis
    return this.recordAttendance(employeeId, AttendanceMethod.QR, 'IN');
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
        if (now > graceEnd) {
          record.status = AttendanceStatus.LATE;
        }
      }
    } else {
      if (!record || !record.checkIn)
        throw new ConflictException('No check-in record found for today');

      record.checkOut = timestamp || new Date();
      record.location = location as any;

      // Calculate overtime if check-out is after shift end
      if (employee.shift && record.checkOut) {
        const shiftEnd = new Date(`${today}T${employee.shift.endTime}:00`);
        if (record.checkOut > shiftEnd) {
          const diffMs = record.checkOut.getTime() - shiftEnd.getTime();
          record.overtimeMinutes = Math.floor(diffMs / 60000);
          record.isOvertime = record.overtimeMinutes > 30;
        }
      }
    }

    return this.attendanceRepo.save(record);
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
