import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

import { Milestone } from './entities/milestone.entity';
import { TimeLog } from './entities/time-log.entity';
import { Timesheet, TimesheetStatus } from './entities/timesheet.entity';
import { ProjectRisk } from './entities/project-risk.entity';
import { ChangeRequest } from './entities/change-request.entity';
import { ProjectTemplate } from './entities/project-template.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Milestone)
    private readonly milestoneRepo: Repository<Milestone>,
    @InjectRepository(TimeLog)
    private readonly timeLogRepo: Repository<TimeLog>,
    @InjectRepository(Timesheet)
    private readonly timesheetRepo: Repository<Timesheet>,
    @InjectRepository(ProjectRisk)
    private readonly riskRepo: Repository<ProjectRisk>,
    @InjectRepository(ChangeRequest)
    private readonly changeRequestRepo: Repository<ChangeRequest>,
    @InjectRepository(ProjectTemplate)
    private readonly templateRepo: Repository<ProjectTemplate>,
  ) {}

  async getTaskStats() {
    return this.taskRepo
      .createQueryBuilder('task')
      .select('task.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('task.status')
      .getRawMany<{ status: string; count: string }>();
  }

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

  async createTask(dto: any): Promise<Task> {
    const project = await this.findProjectById(dto.projectId);
    
    let parent: Task | null = null;
    if (dto.parentId) {
      parent = await this.taskRepo.findOneBy({ id: dto.parentId });
      if (!parent) throw new NotFoundException('Parent task not found');
    }

    const task = this.taskRepo.create({ ...dto, project, parent } as unknown as Task);
    return this.taskRepo.save(task);
  }

  async getProjectTasksTree(projectId: string): Promise<Task[]> {
    // Requires closure table initialized in TypeORM
    const treeRepo = this.taskRepo.manager.getTreeRepository(Task);
    const roots = await treeRepo.findRoots();
    // Filter roots by project ID
    const projectRoots = roots.filter(t => t.projectId === projectId);
    
    const treeTasks = await Promise.all(
      projectRoots.map(root => treeRepo.findDescendantsTree(root))
    );
    return treeTasks;
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

  // --- TIME TRACKING ---
  async startTimeLog(taskId: string, userId: string): Promise<TimeLog> {
    const log = this.timeLogRepo.create({
      taskId,
      userId,
      startTime: new Date(),
    } as unknown as TimeLog);
    return this.timeLogRepo.save(log);
  }

  async stopTimeLog(logId: string): Promise<TimeLog> {
    const log = await this.timeLogRepo.findOneBy({ id: logId });
    if (!log) throw new NotFoundException('Time log not found');
    log.endTime = new Date();
    // Calculate duration in hours
    const diffMs = log.endTime.getTime() - log.startTime.getTime();
    log.durationHours = diffMs / (1000 * 60 * 60);
    return this.timeLogRepo.save(log);
  }

  async bulkTimeLog(dto: any): Promise<TimeLog[]> {
    // Expects array of logs
    const logs = this.timeLogRepo.create(dto as any[]) as TimeLog[];
    return this.timeLogRepo.save(logs);
  }

  // --- TIMESHEETS ---
  async submitTimesheet(userId: string, periodStartDate: Date, periodEndDate: Date): Promise<Timesheet> {
    const logs = await this.timeLogRepo.createQueryBuilder('log')
      .where('log.userId = :userId', { userId })
      .andWhere('log.startTime >= :start', { start: periodStartDate })
      .andWhere('log.startTime <= :end', { end: periodEndDate })
      .getMany();

    const totalHours = logs.reduce((sum, log) => sum + (log.durationHours || 0), 0);

    const timesheet = this.timesheetRepo.create({
      userId,
      periodStartDate,
      periodEndDate,
      totalHours,
      status: TimesheetStatus.SUBMITTED,
    } as unknown as Timesheet);
    
    const saved = await this.timesheetRepo.save(timesheet);

    // Link logs to timesheet
    for (const log of logs) {
      log.timesheetId = saved.id;
    }
    await this.timeLogRepo.save(logs);

    return saved;
  }

  async approveTimesheet(timesheetId: string, managerId: string): Promise<Timesheet> {
    const timesheet = await this.timesheetRepo.findOneBy({ id: timesheetId });
    if (!timesheet) throw new NotFoundException('Timesheet not found');
    
    timesheet.status = TimesheetStatus.APPROVED;
    timesheet.managerId = managerId;
    const saved = await this.timesheetRepo.save(timesheet);

    // TODO: Send event to Finance module to generate invoice line items for billable logs

    return saved;
  }

  // --- ANALYTICS ---
  async getProjectHealth(projectId: string) {
    const project = await this.findProjectById(projectId);
    const logs = await this.timeLogRepo.createQueryBuilder('log')
      .innerJoin('log.task', 'task')
      .where('task.projectId = :projectId', { projectId })
      .getMany();
    
    const actualHours = logs.reduce((sum, log) => sum + (log.durationHours || 0), 0);
    const budgetHours = project.budgetTime || 0;
    
    const scopeCreep = budgetHours > 0 ? ((actualHours - budgetHours) / budgetHours) * 100 : 0;
    const statusRAG = scopeCreep > 20 ? 'RED' : scopeCreep > 0 ? 'AMBER' : 'GREEN';

    return {
      actualHours,
      budgetHours,
      scopeCreepPercentage: Math.max(0, scopeCreep),
      statusRAG,
    };
  }

  async getResourceAllocation() {
    const data = await this.timeLogRepo.createQueryBuilder('log')
      .select('log.userId', 'userId')
      .addSelect('SUM(log.durationHours)', 'totalHours')
      .where('log.startTime >= :date', { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }) // Last 30 days
      .groupBy('log.userId')
      .getRawMany();
    return data;
  }
}
