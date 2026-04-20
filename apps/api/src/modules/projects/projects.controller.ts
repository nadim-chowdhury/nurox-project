import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  createProject(@Body() dto: any) {
    return this.projectsService.createProject(dto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.projectsService.findAllProjects(
      Number(page) || 1,
      Number(limit) || 20,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findProjectById(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.projectsService.updateProject(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.removeProject(id);
  }

  // ─── TASKS ──────────────────────────────────────────────────

  @Post('tasks')
  createTask(@Body() dto: any) {
    return this.projectsService.createTask(dto);
  }

  @Get('tasks')
  findAllTasks(
    @Query('projectId') projectId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.projectsService.findAllTasks(
      projectId,
      Number(page) || 1,
      Number(limit) || 50,
    );
  }

  @Get('tasks/:id')
  findTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findTaskById(id);
  }

  @Patch('tasks/:id')
  updateTask(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.projectsService.updateTask(id, dto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.removeTask(id);
  }
}
