import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest, LeaveBalance } from './entities/leave.entity';
import { CompensatoryLeave } from './entities/comp-leave.entity';
import { Employee } from '../hr/entities/employee.entity';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveProcessor } from './leave-processor.service';
import { SystemModule } from '../system/system.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveRequest,
      LeaveBalance,
      Employee,
      CompensatoryLeave,
    ]),
    SystemModule,
    BullModule.registerQueue({
      name: 'leave',
    }),
  ],
  controllers: [LeaveController],
  providers: [LeaveService, LeaveProcessor],
  exports: [LeaveService],
})
export class LeaveModule {}
