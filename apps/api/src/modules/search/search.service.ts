import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// @ts-expect-error - moduleResolution: node can't resolve meilisearch exports
import { Meilisearch } from 'meilisearch';
import { SearchQuery } from './entities/search-query.entity';
import { AiService } from '../ai/services/ai.service';

@Injectable()
export class SearchService implements OnModuleInit {
  private client: Meilisearch;
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
    @InjectRepository(SearchQuery)
    private readonly queryRepo: Repository<SearchQuery>,
  ) {
    const host =
      this.configService.get<string>('search.host') || 'http://localhost:7700';
    const apiKey =
      this.configService.get<string>('search.apiKey') || 'masterKey';

    try {
      this.client = new Meilisearch({ host, apiKey });
    } catch (error) {
      this.logger.error('Failed to initialize Meilisearch client', error);
    }
  }

  async onModuleInit() {
    if (!this.client) return;

    // Configure searchable/filterable attributes for common indices
    const indices = ['products', 'invoices', 'employees', 'chat_messages'];

    for (const indexName of indices) {
      try {
        const index = this.client.index(indexName);
        await index.updateSettings({
          filterableAttributes: ['tenantId', 'id', 'status', 'category'],
          sortableAttributes: ['createdAt', 'updatedAt'],
          // Enable vector search
          embedders: {
            default: {
              source: 'userProvided',
              dimensions: 1536,
            },
          },
        });
        this.logger.log(`Configured Meilisearch index: ${indexName}`);
      } catch (error) {
        this.logger.warn(`Failed to configure Meilisearch index: ${indexName}`);
      }
    }
  }

  async indexDocument(indexName: string, document: Record<string, any>) {
    if (!this.client) return;
    try {
      // Generate embedding for AI-powered search
      const textToEmbed = this.extractTextForEmbedding(indexName, document);
      const _vectors = await this.aiService.createEmbedding(textToEmbed);

      await this.client.index(indexName).addDocuments([
        {
          ...document,
          _vectors,
        },
      ]);
    } catch (error) {
      this.logger.error(`Failed to index document in ${indexName}`, error);
    }
  }

  private extractTextForEmbedding(indexName: string, doc: any): string {
    switch (indexName) {
      case 'products':
        return `${doc.name} ${doc.sku} ${doc.description || ''} ${doc.category || ''}`;
      case 'invoices':
        return `${doc.invoiceNumber} ${doc.customerName} ${doc.status}`;
      case 'employees':
        return `${doc.firstName} ${doc.lastName} ${doc.employeeId} ${doc.designation} ${doc.department}`;
      case 'chat_messages':
        return doc.content;
      default:
        return JSON.stringify(doc);
    }
  }

  async deleteDocument(indexName: string, documentId: string | number) {
    if (!this.client) return;
    try {
      await this.client.index(indexName).deleteDocument(documentId);
    } catch (error) {
      this.logger.error(
        `Failed to delete document ${documentId} from ${indexName}`,
        error,
      );
    }
  }

  async search(
    tenantId: string,
    indexName: string,
    query: string,
    options: any = {},
  ) {
    if (!this.client) return { hits: [], totalHits: 0 };

    // Enforce tenant isolation via filters
    const filter = options.filter
      ? `(${options.filter}) AND tenantId = "${tenantId}"`
      : `tenantId = "${tenantId}"`;

    try {
      // Hybrid search: Vector + Keyword
      const vector = await this.aiService.createEmbedding(query);

      return await this.client.index(indexName).search(query, {
        ...options,
        filter,
        vector,
        hybrid: {
          semanticRatio: 0.5, // 50% keyword, 50% semantic
          embedder: 'default',
        },
      });
    } catch (error) {
      this.logger.error(`Search failed in ${indexName}`, error);
      return { hits: [], totalHits: 0 };
    }
  }

  async multiSearch(
    tenantId: string,
    queries: { indexUid: string; q: string; limit?: number }[],
  ) {
    if (!this.client) return { results: [] };

    const formattedQueries = await Promise.all(
      queries.map(async (q) => {
        const vector = await this.aiService.createEmbedding(q.q);
        return {
          ...q,
          filter: `tenantId = "${tenantId}"`,
          vector,
          hybrid: {
            semanticRatio: 0.5,
            embedder: 'default',
          },
        };
      }),
    );

    try {
      return await this.client.multiSearch({
        queries: formattedQueries,
      });
    } catch (error) {
      this.logger.error('Multi-search failed', error);
      return { results: [] };
    }
  }

  async logSearch(
    tenantId: string,
    userId: string,
    query: string,
    resultsCount: number,
  ) {
    try {
      const log = this.queryRepo.create({
        tenantId,
        userId,
        query,
        resultsCount,
      });
      return await this.queryRepo.save(log);
    } catch (error) {
      this.logger.error('Failed to log search query', error);
      return null;
    }
  }

  async trackClick(tenantId: string, queryId: string, entityId: string) {
    try {
      const log = await this.queryRepo.findOne({
        where: { id: queryId, tenantId },
      });
      if (log) {
        log.clickCount += 1;
        const clicked = log.clickedResults || [];
        if (!clicked.includes(entityId)) {
          clicked.push(entityId);
        }
        log.clickedResults = clicked;
        await this.queryRepo.save(log);
      }
    } catch (error) {
      this.logger.error('Failed to track search click', error);
    }
  }
}
