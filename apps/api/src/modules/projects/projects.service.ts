import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  async createProject(dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  async findAllProjects(): Promise<Project[]> {
    return this.projectRepo.find({
      relations: ['tasks'],
      order: { createdAt: 'DESC' },
    });
  }

  async findProjectById(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['tasks'],
    });
    if (!project)
      throw new NotFoundException(`Project with ID ${id} not found`);
    return project;
  }

  async updateProject(id: string, dto: UpdateProjectDto): Promise<Project> {
    const project = await this.findProjectById(id);
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async removeProject(id: string): Promise<void> {
    const result = await this.projectRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
  }

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const project = await this.findProjectById(dto.projectId);
    const task = this.taskRepo.create({ ...dto, project });
    return this.taskRepo.save(task);
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    Object.assign(task, dto);
    await this.taskRepo.save(task);

    // Trigger project progress dynamic update
    await this.calculateProjectProgress(task.projectId);

    return task;
  }

  async removeTask(id: string): Promise<void> {
    const task = await this.taskRepo.findOneBy({ id });
    if (!task) throw new NotFoundException(`Task with ID ${id} not found`);

    await this.taskRepo.delete(id);
    await this.calculateProjectProgress(task.projectId);
  }

  private async calculateProjectProgress(projectId: string): Promise<void> {
    const project = await this.findProjectById(projectId);
    const tasks = project.tasks;
    if (tasks.length === 0) return;

    const completedTasks = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED,
    ).length;
    const progress = Math.round((completedTasks / tasks.length) * 100);

    project.progress = progress;
    await this.projectRepo.save(project);
  }
}
