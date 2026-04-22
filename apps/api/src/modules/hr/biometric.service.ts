import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import * as net from 'net';
import { AttendanceMethod } from './entities/attendance.entity';

@Injectable()
export class BiometricService implements OnModuleInit {
  private readonly logger = new Logger(BiometricService.name);
  private readonly devicePort = 4370; // Common ZKTeco port
  private readonly deviceIp = '192.168.1.201'; // Example IP

  constructor(private readonly attendanceService: AttendanceService) {}

  onModuleInit() {
    this.logger.log('Biometric bridge initialized');
    // In a real scenario, this would start the polling or listener
    // this.startPolling();
  }

  /**
   * Simulated TCP client to poll device data
   */
  async startPolling() {
    this.logger.log(
      `Starting biometric poll for ${this.deviceIp}:${this.devicePort}`,
    );

    // In actual implementation, you'd use a ZKTeco library like 'zklib' or custom TCP commands
    const client = new net.Socket();

    client.connect(this.devicePort, this.deviceIp, () => {
      this.logger.log('Connected to biometric device');
      // Send command to retrieve attendance logs
    });

    client.on('data', (data) => {
      this.logger.log('Received data from biometric device');
      this.processDeviceData(data);
    });

    client.on('error', (err) => {
      this.logger.error(`Biometric device error: ${err.message}`);
    });
  }

  private processDeviceData(data: Buffer) {
    // Decode data based on ZKTeco protocol
    // For now, let's mock a successful read
    const mockRecord = {
      employeeId: 'EMP-001', // This should be mapped from device's user ID to system's employee ID
      timestamp: new Date(),
      type: 'IN' as const,
    };

    // Find employee by internal biometric ID
    // Then call attendance service
    // this.attendanceService.recordAttendance(internalEmployeeId, AttendanceMethod.BIOMETRIC, mockRecord.type);
  }
}
