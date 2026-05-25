import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { Task } from './entities/task.entity';
import { Milestone } from './entities/milestone.entity';
import { TimeLog } from './entities/time-log.entity';
import { Timesheet } from './entities/timesheet.entity';
import { ProjectRisk } from './entities/project-risk.entity';
import { ChangeRequest } from './entities/change-request.entity';
import { ProjectTemplate } from './entities/project-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Task,
      Milestone,
      TimeLog,
      Timesheet,
      ProjectRisk,
      ChangeRequest,
      ProjectTemplate,
    ]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
