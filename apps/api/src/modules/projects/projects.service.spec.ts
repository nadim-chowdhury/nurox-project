import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Task } from './entities/task.entity';
import { Milestone } from './entities/milestone.entity';
import { TimeLog } from './entities/time-log.entity';
import { Timesheet } from './entities/timesheet.entity';
import { ProjectRisk } from './entities/project-risk.entity';
import { ChangeRequest } from './entities/change-request.entity';
import { ProjectTemplate } from './entities/project-template.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;

  const mockRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: getRepositoryToken(Project), useValue: mockRepo },
        {
          provide: getRepositoryToken(Task),
          useValue: {
            ...mockRepo,
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn(),
            })),
          },
        },
        { provide: getRepositoryToken(Milestone), useValue: mockRepo },
        { provide: getRepositoryToken(TimeLog), useValue: mockRepo },
        { provide: getRepositoryToken(Timesheet), useValue: mockRepo },
        { provide: getRepositoryToken(ProjectRisk), useValue: mockRepo },
        { provide: getRepositoryToken(ChangeRequest), useValue: mockRepo },
        { provide: getRepositoryToken(ProjectTemplate), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
