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
}
