import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../../ai/services/ai.service';
import { TicketsService } from './tickets.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from '../entities/ticket.entity';
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

  @OnEvent('ticket.created')
  async handleTicketCreated(payload: { tenantId: string; ticketId: string }) {
    try {
      await this.analyzeTicket(payload.tenantId, payload.ticketId);
    } catch (error) {
      this.logger.error(
        `Failed to automatically analyze ticket ${payload.ticketId}`,
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
