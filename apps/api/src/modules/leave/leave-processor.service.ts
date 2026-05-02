import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { LeaveService } from './leave.service';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveBalance, LeaveType } from './entities/leave.entity';
import { Repository } from 'typeorm';

@Processor('leave')
export class LeaveProcessor extends WorkerHost {
  private readonly logger = new Logger(LeaveProcessor.name);

  constructor(
    @InjectRepository(LeaveBalance)
    private readonly balanceRepo: Repository<LeaveBalance>,
    private readonly leaveService: LeaveService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'year-end-carry-forward':
        return this.handleYearEndCarryForward(job.data);
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleYearEndCarryForward(data: {
    fiscalYear: string;
    nextFiscalYear: string;
  }) {
    this.logger.log(`Starting year-end carry forward for ${data.fiscalYear}`);

    const balances = await this.balanceRepo.find({
      where: { fiscalYear: data.fiscalYear },
    });

    for (const b of balances) {
      const remaining = Number(b.totalDays) - Number(b.usedDays);
      if (remaining > 0) {
        // Carry forward logic: max 10 days for ANNUAL, others usually lapse
        let carryForward = 0;
        if (b.leaveType === LeaveType.ANNUAL) {
          carryForward = Math.min(remaining, 10);
        }

        // Create new balance for next year
        const newBalance = this.balanceRepo.create({
          employeeId: b.employeeId,
          leaveType: b.leaveType,
          totalDays: this.getBaseDaysForType(b.leaveType) + carryForward,
          usedDays: 0,
          carriedForwardDays: carryForward,
          fiscalYear: data.nextFiscalYear,
        });
        await this.balanceRepo.save(newBalance);
      }
    }

    this.logger.log(`Completed year-end carry forward for ${data.fiscalYear}`);
  }

  private getBaseDaysForType(type: LeaveType): number {
    switch (type) {
      case LeaveType.ANNUAL:
        return 20;
      case LeaveType.SICK:
        return 10;
      case LeaveType.CASUAL:
        return 10;
      default:
        return 0;
    }
  }
}
