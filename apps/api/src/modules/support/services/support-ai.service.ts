import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../../ai/services/ai.service';
import { TicketsService } from './tickets.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from '../entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class SupportAiService {
  private readonly logger = new Logger(SupportAiService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly ticketsService: TicketsService,
    private readonly kbService: KnowledgeBaseService,
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async analyzeTicket(tenantId: string, ticketId: string) {
    const ticket = await this.ticketsService.getTicket(tenantId, ticketId);

    this.logger.log(
      `Analyzing ticket ${ticketId} for sentiment and suggestions...`,
    );

    // 1. Sentiment Analysis
    const sentimentPrompt = `Analyze the sentiment of the following support ticket. 
    Title: ${ticket.title}
    Description: ${ticket.description}
    
    Respond with exactly one word from this list: Positive, Neutral, Negative, Frustrated.`;

    const sentiment = await this.aiService.generateText({
      prompt: sentimentPrompt,
      type: 'support_analysis',
    });

    // 2. Suggestion based on Knowledge Base
    const kbArticles = await this.kbService.searchArticles(
      tenantId,
      ticket.title,
    );
    const kbContext = kbArticles
      .map((a) => `Article: ${a.title}\nContent: ${a.content}`)
      .join('\n\n');

    const suggestionPrompt = `You are a support agent. Based on the following knowledge base context and the ticket details, suggest a resolution.
    
    Ticket Title: ${ticket.title}
    Ticket Description: ${ticket.description}
    
    Knowledge Base Context:
    ${kbContext || 'No relevant articles found.'}
    
    Provide a concise resolution suggestion.`;

    const suggestion = await this.aiService.generateChatResponse(
      [{ role: 'user', content: suggestionPrompt }],
      'Support AI Assistant',
    );

    // Update ticket
    ticket.sentiment = sentiment.trim();
    ticket.aiSuggestion = suggestion;
    await this.ticketRepo.save(ticket);

    return { sentiment: ticket.sentiment, aiSuggestion: ticket.aiSuggestion };
  }

  async analyzeGap(tenantId: string) {
    this.logger.log(`Performing KB Gap Analysis for tenant ${tenantId}...`);

    // 1. Fetch recent resolved/closed tickets for better insight into solved problems
    const tickets = await this.ticketRepo.find({
      where: { tenantId },
      take: 20,
      order: { createdAt: 'DESC' },
    });

    // 2. Fetch existing articles to know what we already have
    const articles = await this.kbService.searchArticles(tenantId, '');

    if (tickets.length === 0) {
      return {
        suggestions: [],
        message: 'Not enough ticket data to perform gap analysis.',
      };
    }

    // 3. Prepare AI Context
    const ticketContext = tickets
      .map(
        (t, i) =>
          `${i + 1}. [${t.category || 'Uncategorized'}] ${t.title}: ${t.description?.substring(0, 100)}...`,
      )
      .join('\n');

    const articleContext =
      articles.length > 0
        ? articles.map((a) => `- ${a.title}`).join('\n')
        : 'None';

    const prompt = `Analyze these support tickets and compare them against the existing Knowledge Base (KB) articles.
    
    TICKETS:
    ${ticketContext}
    
    EXISTING ARTICLES:
    ${articleContext}
    
    Identify 3 major "gaps" where multiple tickets deal with a topic not covered by a KB article. 
    For each gap, suggest a new KB article.
    
    Return the response as a JSON array of objects with these keys: "title", "reason", "suggestedCategory".`;

    const response = await this.aiService.generateChatResponse(
      [{ role: 'user', content: prompt }],
      'Support Gap Analyst',
    );

    try {
      // Extract JSON from potential markdown wrappers
      const jsonMatch = response.match(/\[.*\]/s);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      const suggestions = JSON.parse(jsonMatch[0]);
      return { suggestions };
    } catch (error) {
      this.logger.error('Failed to parse AI gap analysis response', error);
      return {
        suggestions: [],
        rawResponse: response,
        error: 'Failed to parse AI response into structured data.',
      };
    }
  }

  async getSuggestedReply(tenantId: string, ticketId: string) {
    const ticket = await this.ticketsService.getTicket(tenantId, ticketId);

    const prompt = `Generate a professional and helpful reply to the following ticket. 
    Use the existing AI suggestion if relevant.
    
    Ticket: ${ticket.title}
    Description: ${ticket.description}
    AI Suggestion: ${ticket.aiSuggestion || 'N/A'}
    
    Reply:`;

    return this.aiService.generateChatResponse(
      [{ role: 'user', content: prompt }],
      'Support AI Agent',
    );
  }

  async routeTicket(tenantId: string, ticketId: string) {
    const ticket = await this.ticketsService.getTicket(tenantId, ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const agents = await this.userRepo.find({
      where: { tenantId, status: 'ACTIVE' },
    });

    if (agents.length === 0) {
      this.logger.warn(
        `No active agents available for tenant ${tenantId} to route ticket ${ticketId}`,
      );
      return {
        ticketId,
        assigneeId: null,
        routingMethod: 'NONE',
        reason: 'No active agents available',
      };
    }

    let matchedAgent: User | undefined;
    let routingMethod = 'RULE';

    const category = (ticket.category || '').toUpperCase();
    const sentiment = (ticket.sentiment || '').toUpperCase();

    // Priority / Urgent Rule: Frustrated or P1 sentiment routes to ADMIN / SUPER_ADMIN if available
    if (sentiment === 'FRUSTRATED' || ticket.priority === 'P1') {
      matchedAgent = agents.find(
        (a) => a.role === 'ADMIN' || a.role === 'SUPER_ADMIN',
      );
    }

    // Category-specific Rule
    if (!matchedAgent && category) {
      if (category.includes('FINANCE') || category.includes('BILLING')) {
        matchedAgent = agents.find(
          (a) => a.role === 'FINANCE_MANAGER' || a.role === 'ADMIN',
        );
      } else if (category.includes('HR') || category.includes('PAYROLL')) {
        matchedAgent = agents.find(
          (a) => a.role === 'HR_MANAGER' || a.role === 'ADMIN',
        );
      } else if (category.includes('INVENTORY') || category.includes('STOCK')) {
        matchedAgent = agents.find(
          (a) => a.role === 'INVENTORY_MANAGER' || a.role === 'ADMIN',
        );
      } else if (category.includes('PROJECT')) {
        matchedAgent = agents.find(
          (a) => a.role === 'PROJECT_MANAGER' || a.role === 'ADMIN',
        );
      }
    }

    // AI-assisted routing fallback
    if (!matchedAgent && agents.length > 1) {
      try {
        routingMethod = 'AI';
        const candidates = agents
          .map(
            (a) =>
              `ID: ${a.id}, Name: ${a.firstName} ${a.lastName}, Role: ${a.role}`,
          )
          .join('\n');

        const prompt = `Select the single best agent to assign to this ticket based on their role.
        Ticket Title: ${ticket.title}
        Ticket Description: ${ticket.description}
        Category: ${ticket.category || 'N/A'}
        Sentiment: ${ticket.sentiment || 'N/A'}
        Priority: ${ticket.priority}

        CANDIDATE AGENTS:
        ${candidates}

        Respond with ONLY the candidate agent ID.`;

        const chosenId = await this.aiService.generateText({
          prompt,
          type: 'support_analysis',
        });

        const selected = agents.find((a) => chosenId.includes(a.id));
        if (selected) {
          matchedAgent = selected;
        }
      } catch (err) {
        this.logger.error(
          `AI-assisted routing failed for ticket ${ticketId}: ${err}`,
        );
      }
    }

    // Fallback to first available agent if no match
    if (!matchedAgent) {
      matchedAgent = agents[0];
    }

    ticket.assigneeId = matchedAgent.id;
    await this.ticketRepo.save(ticket);

    this.logger.log(
      `Routed ticket ${ticketId} to agent ${matchedAgent.email} via ${routingMethod}`,
    );

    return {
      ticketId,
      assigneeId: matchedAgent.id,
      assigneeName: `${matchedAgent.firstName} ${matchedAgent.lastName}`,
      routingMethod,
    };
  }

  @OnEvent('ticket.created')
  async handleTicketCreated(payload: { tenantId: string; ticketId: string }) {
    try {
      await this.analyzeTicket(payload.tenantId, payload.ticketId);
      await this.routeTicket(payload.tenantId, payload.ticketId);
    } catch (error) {
      this.logger.error(
        `Failed to automatically analyze and route ticket ${payload.ticketId}`,
        error,
      );
    }
  }

  @OnEvent('ticket.message_added')
  async handleMessageAdded(payload: {
    tenantId: string;
    ticketId: string;
    senderId: string;
    isInternal: boolean;
  }) {
    // Only re-analyze if the message is from the requester (external)
    if (!payload.isInternal) {
      try {
        await this.analyzeTicket(payload.tenantId, payload.ticketId);
      } catch (error) {
        this.logger.error(
          `Failed to re-analyze ticket ${payload.ticketId} after message`,
          error,
        );
      }
    }
  }
}
