import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from '../services/ai.service';
import { ChatRequestDto, chatRequestSchema } from '@repo/shared-schemas';
import { ZodValidationPipe } from 'nestjs-zod';
import { UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('ai/chat')
export class AiAssistantController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(chatRequestSchema))
  async chat(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: ChatRequestDto,
  ) {
    // Inject user/tenant context securely
    const context = `Tenant ID: ${tenantId}, User ID: ${user.id}. ${dto.context || ''}`;
    const responseText = await this.aiService.generateChatResponse(
      dto.messages,
      context,
    );

    return {
      message: {
        role: 'assistant',
        content: responseText,
      },
    };
  }
}
