import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KbArticle } from '../entities/kb-article.entity';
// import { MeiliSearchService } from '../../integrations/meilisearch/meilisearch.service';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    @InjectRepository(KbArticle)
    private readonly kbRepo: Repository<KbArticle>,
    // private readonly meiliSearch: MeiliSearchService,
  ) {}

  async createArticle(
    tenantId: string,
    authorId: string,
    dto: {
      title: string;
      content: string;
      category: string;
      isPublic: boolean;
    },
  ) {
    const article = this.kbRepo.create({
      tenantId,
      authorId,
      ...dto,
      status: 'DRAFT',
    });
    return this.kbRepo.save(article);
  }

  async publishArticle(tenantId: string, articleId: string) {
    const article = await this.kbRepo.findOne({
      where: { id: articleId, tenantId },
    });
    if (!article)
      throw new HttpException('Article not found', HttpStatus.NOT_FOUND);

    article.status = 'PUBLISHED';
    await this.kbRepo.save(article);

    // Sync to MeiliSearch
    // await this.meiliSearch.indexDocument('kb_articles', {
    //   id: article.id,
    //   title: article.title,
    //   content: article.content,
    //   category: article.category,
    //   tenantId: article.tenantId,
    // });

    return article;
  }

  async searchArticles(tenantId: string, query: string) {
    // We would ideally query MeiliSearch here
    // return this.meiliSearch.search('kb_articles', query, { filter: `tenantId = ${tenantId}` });

    // Fallback to basic DB ILIKE search
    return this.kbRepo
      .createQueryBuilder('article')
      .where('article.tenantId = :tenantId', { tenantId })
      .andWhere('article.status = :status', { status: 'PUBLISHED' })
      .andWhere(
        '(article.title ILIKE :query OR article.content ILIKE :query)',
        { query: `%${query}%` },
      )
      .getMany();
  }

  async suggestArticlesUsingAi(query: string) {
    this.logger.log(`[AI Stub] Finding articles for query: "${query}"`);
    // Example: Call OpenAI embeddings API and do a cosine similarity search against pgvector or MeiliSearch
    return [
      { id: 'mock-1', title: 'How to reset your password', score: 0.95 },
      { id: 'mock-2', title: 'Configuring SSO', score: 0.82 },
    ];
  }
}
