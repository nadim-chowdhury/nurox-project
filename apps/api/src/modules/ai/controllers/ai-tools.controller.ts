import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from '../services/ai.service';
import { DocumentProcessorService } from '../services/document-processor.service';
import {
  TextGenerationRequestDto,
  DocumentExtractionRequestDto,
  textGenerationRequestSchema,
  documentExtractionRequestSchema,
} from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/tools')
export class AiToolsController {
  constructor(
    private readonly aiService: AiService,
    private readonly documentProcessor: DocumentProcessorService,
  ) {}

  @Post('generate-text')
  @UsePipes(new ZodValidationPipe(textGenerationRequestSchema))
  async generateText(@Body() dto: TextGenerationRequestDto) {
    const text = await this.aiService.generateText(dto);
    return { text };
  }

  @Post('extract-document')
  @UsePipes(new ZodValidationPipe(documentExtractionRequestSchema))
  async extractDocumentData(@Body() dto: DocumentExtractionRequestDto) {
    const data = await this.documentProcessor.extractDataFromDocument(dto);
    return { data };
  }

  @Post('categorize-expense')
  async categorizeExpense(
    @Body() body: { description: string; amount: number },
  ) {
    const category = await this.documentProcessor.categorizeExpense(
      body.description,
      body.amount,
    );
    return { category };
  }
}
