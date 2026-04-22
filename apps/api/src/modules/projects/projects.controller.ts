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
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';

@Controller('projects')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  createProject(@Body() dto: CreateProjectDto) {
    return this.projectsService.createProject(dto);
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
    return this.projectsService.updateProject(id, dto);
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
    return this.projectsService.createTask(dto);
  }

  @Patch('tasks/:id')
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.projectsService.updateTask(id, dto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.PROJECTS_MANAGE)
  removeTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.removeTask(id);
  }
}
