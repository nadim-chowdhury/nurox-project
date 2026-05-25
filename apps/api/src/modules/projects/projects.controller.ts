import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  type CreateProjectDto,
  type UpdateProjectDto,
  type CreateTaskDto,
  type UpdateTaskDto,
} from '@repo/shared-schemas';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { CheckModule } from '../../common/guards/module.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@CheckModule('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  createProject(@Body() dto: CreateProjectDto) {
    const parsed = createProjectSchema.parse(dto);
    return this.projectsService.createProject(parsed as any);
  }

  @Get()
  @RequirePermissions(Permission.PROJECTS_VIEW)
  findAllProjects() {
    return this.projectsService.findAllProjects();
  }

  @Get(':id')
  @RequirePermissions(Permission.PROJECTS_VIEW)
  findProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findProjectById(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const parsed = updateProjectSchema.parse(dto);
    return this.projectsService.updateProject(id, parsed as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  removeProject(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.removeProject(id);
  }

  @Post('tasks')
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  createTask(@Body() dto: CreateTaskDto) {
    const parsed = createTaskSchema.parse(dto);
    return this.projectsService.createTask(parsed as any);
  }

  @Patch('tasks/:id')
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const parsed = updateTaskSchema.parse(dto);
    return this.projectsService.updateTask(id, parsed as any);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  removeTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.removeTask(id);
  }

  // --- NEW ENDPOINTS ---
  @Get(':id/tasks/tree')
  @RequirePermissions(Permission.PROJECTS_VIEW)
  getProjectTasksTree(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getProjectTasksTree(id);
  }

  @Post('tasks/:id/time-log/start')
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  startTimeLog(@Param('id', ParseUUIDPipe) id: string, @Body('userId') userId: string) {
    return this.projectsService.startTimeLog(id, userId);
  }

  @Post('time-log/:id/stop')
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  stopTimeLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.stopTimeLog(id);
  }

  @Post('timesheets/submit')
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  submitTimesheet(
    @Body('userId') userId: string,
    @Body('periodStartDate') periodStartDate: string,
    @Body('periodEndDate') periodEndDate: string,
  ) {
    return this.projectsService.submitTimesheet(userId, new Date(periodStartDate), new Date(periodEndDate));
  }

  @Post('timesheets/:id/approve')
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  approveTimesheet(@Param('id', ParseUUIDPipe) id: string, @Body('managerId') managerId: string) {
    return this.projectsService.approveTimesheet(id, managerId);
  }

  @Get('analytics/health/:id')
  @RequirePermissions(Permission.PROJECTS_VIEW)
  getProjectHealth(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.getProjectHealth(id);
  }

  @Get('analytics/resource-allocation')
  @RequirePermissions(Permission.PROJECTS_VIEW)
  getResourceAllocation() {
    return this.projectsService.getResourceAllocation();
  }
}
