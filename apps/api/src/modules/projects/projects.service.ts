import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Task } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
  ) {}

  // ─── PROJECTS ───────────────────────────────────────────────

  async createProject(dto: Partial<Project>): Promise<Project> {
    const project = this.projectRepo.create(dto);
    const saved = await this.projectRepo.save(project);
    this.logger.log(`Project created: ${saved.name}`);
    return saved;
  }

  async findAllProjects(page = 1, limit = 20) {
    const [data, total] = await this.projectRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findProjectById(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['tasks'],
    });
    if (!project) throw new NotFoundException(`Project "${id}" not found`);
    return project;
  }

  async updateProject(id: string, dto: Partial<Project>): Promise<Project> {
    await this.findProjectById(id);
    await this.projectRepo.update(id, dto);
    return this.findProjectById(id);
  }

  async removeProject(id: string): Promise<void> {
    await this.findProjectById(id);
    await this.projectRepo.softDelete(id);
  }

  // ─── TASKS ──────────────────────────────────────────────────

  async createTask(dto: Partial<Task>): Promise<Task> {
    const task = this.taskRepo.create(dto);
    const saved = await this.taskRepo.save(task);
    this.logger.log(`Task created: ${saved.title}`);
    return saved;
  }

  async findAllTasks(projectId?: string, page = 1, limit = 50) {
    const qb = this.taskRepo.createQueryBuilder('t');
    if (projectId) qb.andWhere('t.projectId = :projectId', { projectId });
    qb.orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findTaskById(id: string): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException(`Task "${id}" not found`);
    return task;
  }

  async updateTask(id: string, dto: Partial<Task>): Promise<Task> {
    await this.findTaskById(id);
    await this.taskRepo.update(id, dto);
    return this.findTaskById(id);
  }

  async removeTask(id: string): Promise<void> {
    await this.findTaskById(id);
    await this.taskRepo.softDelete(id);
  }
}
