import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest, LeaveBalance } from './entities/leave.entity';
import { CompensatoryLeave } from './entities/comp-leave.entity';
import { Employee } from '../hr/entities/employee.entity';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveRequest,
      LeaveBalance,
      Employee,
      CompensatoryLeave,
    ]),
    SystemModule,
  ],
  controllers: [LeaveController],
  providers: [LeaveService],
  exports: [LeaveService],
})
export class LeaveModule {}
