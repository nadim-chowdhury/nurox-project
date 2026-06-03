import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import { SupportAiService } from '../services/support-ai.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../../common/guards/tenant.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('support/kb')
export class KnowledgeBaseController {
  constructor(
    private readonly kbService: KnowledgeBaseService,
    private readonly supportAiService: SupportAiService,
  ) {}

  @Post()
  async createArticle(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body()
    dto: {
      title: string;
      content: string;
      category: string;
      isPublic: boolean;
    },
  ) {
    return this.kbService.createArticle(tenantId, user.id, dto);
  }

  @Post(':id/publish')
  async publishArticle(
    @CurrentTenant() tenantId: string,
    @Param('id') articleId: string,
  ) {
    return this.kbService.publishArticle(tenantId, articleId);
  }

  @Get('search')
  async searchArticles(
    @CurrentTenant() tenantId: string,
    @Query('q') query: string,
  ) {
    return this.kbService.searchArticles(tenantId, query);
  }

  @Get('suggest')
  async suggestArticles(@Query('q') query: string) {
    // AI Endpoint
    return this.kbService.suggestArticlesUsingAi(query);
  }

  @Post('gap-analysis')
  async analyzeGaps(@CurrentTenant() tenantId: string) {
    return this.supportAiService.analyzeGap(tenantId);
  }
}
