import { Test, TestingModule } from '@nestjs/testing';
import { SupportAiService } from './support-ai.service';
import { AiService } from '../../ai/services/ai.service';
import { TicketsService } from './tickets.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket } from '../entities/ticket.entity';
import { Repository } from 'typeorm';

describe('SupportAiService', () => {
  let service: SupportAiService;

  const mockTicketRepo = {
    find: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockAiService = {
    generateChatResponse: jest.fn(),
    generateText: jest.fn(),
  };

  const mockTicketsService = {
    getTicket: jest.fn(),
  };

  const mockKbService = {
    searchArticles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportAiService,
        { provide: AiService, useValue: mockAiService },
        { provide: TicketsService, useValue: mockTicketsService },
        { provide: KnowledgeBaseService, useValue: mockKbService },
        { provide: getRepositoryToken(Ticket), useValue: mockTicketRepo },
      ],
    }).compile();

    service = module.get<SupportAiService>(SupportAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeGap', () => {
    it('should return suggestions when tickets are found', async () => {
      const tenantId = 'test-tenant';
      const mockTickets = [
        { title: 'Ticket 1', description: 'Desc 1', category: 'Category 1' },
      ] as Ticket[];
      const mockArticles = [{ title: 'Article 1' }] as any[];
      const mockAiResponse = JSON.stringify([
        {
          title: 'New Article',
          reason: 'Gap found',
          suggestedCategory: 'Category',
        },
      ]);

      mockTicketRepo.find.mockResolvedValue(mockTickets);
      mockKbService.searchArticles.mockResolvedValue(mockArticles);
      mockAiService.generateChatResponse.mockResolvedValue(mockAiResponse);

      const result = await service.analyzeGap(tenantId);

      expect(result.suggestions).toHaveLength(1);
      expect(result.suggestions[0].title).toBe('New Article');
      expect(mockTicketRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId },
        }),
      );
    });

    it('should return a message when no tickets are found', async () => {
      const tenantId = 'test-tenant';
      mockTicketRepo.find.mockResolvedValue([]);
      mockKbService.searchArticles.mockResolvedValue([]);

      const result = await service.analyzeGap(tenantId);

      expect(result.suggestions).toHaveLength(0);
      expect(result.message).toBe(
        'Not enough ticket data to perform gap analysis.',
      );
    });

    it('should handle AI response parsing errors', async () => {
      const tenantId = 'test-tenant';
      mockTicketRepo.find.mockResolvedValue([{ title: 'T1' }] as Ticket[]);
      mockKbService.searchArticles.mockResolvedValue([]);
      mockAiService.generateChatResponse.mockResolvedValue('Invalid JSON');

      const result = await service.analyzeGap(tenantId);

      expect(result.suggestions).toHaveLength(0);
      expect(result.error).toBeDefined();
    });
  });
});
