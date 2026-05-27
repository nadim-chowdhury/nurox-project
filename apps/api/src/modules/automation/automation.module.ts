import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowRule } from './entities/workflow-rule.entity';
import { WorkflowEngineService } from './services/workflow-engine.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowRule])],
  providers: [WorkflowEngineService],
  exports: [WorkflowEngineService],
})
export class AutomationModule {}
