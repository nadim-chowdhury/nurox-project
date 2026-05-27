import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatMessageDto, TextGenerationRequestDto } from '@repo/shared-schemas';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey && apiKey !== 'sk-mock-key') {
      this.openai = new OpenAI({ apiKey });
      this.isConfigured = true;
    } else {
      this.logger.warn(
        'OPENAI_API_KEY is not set or is mock. AI features will run in STUB mode.',
      );
      this.isConfigured = false;
    }
  }

  onModuleInit() {
    this.logger.log(
      `AI Service Initialized. Mode: ${this.isConfigured ? 'LIVE' : 'STUB'}`,
    );
  }

  async generateChatResponse(
    messages: ChatMessageDto[],
    context?: string,
  ): Promise<string> {
    if (!this.isConfigured) {
      return this.stubChatResponse(messages);
    }

    try {
      const systemPrompt = `You are Nurox AI, an intelligent assistant embedded in the Nurox ERP platform. ${context ? 'Current Context: ' + context : ''}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
      });

      return (
        response.choices[0].message.content ||
        'I am sorry, I could not generate a response.'
      );
    } catch (error) {
      this.logger.error('Failed to generate chat response', error);
      throw error;
    }
  }

  async generateText(dto: TextGenerationRequestDto): Promise<string> {
    if (!this.isConfigured) {
      return `[STUB ${dto.type.toUpperCase()}]\n\nBased on your prompt: "${dto.prompt}", here is a generated text block.`;
    }

    try {
      const systemPrompt = this.getSystemPromptForGenerationType(dto.type);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: dto.prompt },
        ],
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      this.logger.error(`Failed to generate text of type ${dto.type}`, error);
      throw error;
    }
  }

  private getSystemPromptForGenerationType(type: string): string {
    switch (type) {
      case 'email':
        return "You are an HR/Management assistant. Write a professional email based on the user's bullet points.";
      case 'meeting_summary':
        return 'You are an assistant. Extract a concise summary and a list of actionable items from the provided meeting notes.';
      case 'report_description':
        return 'You are an ERP data analyst. Generate a clear summary describing what a report should contain based on the user request.';
      default:
        return 'You are a helpful assistant.';
    }
  }

  private stubChatResponse(messages: ChatMessageDto[]): string {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.content.toLowerCase().includes('payroll')) {
      return 'Sure! Based on the ERP data, your Q3 payroll expenses have increased by 4% due to new hires in Engineering.';
    }
    return `[STUB RESPONSE] I am Nurox AI. You said: "${lastMessage.content}". Since no real API key is provided, I am functioning as a mock.`;
  }
}
