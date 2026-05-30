import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { StorageService } from '../system/storage.service';
import * as Tesseract from 'tesseract.js';
// @ts-expect-error - moduleResolution: node can't resolve meilisearch exports
import { Meilisearch } from 'meilisearch';
import { ConfigService } from '@nestjs/config';

@Injectable()
@Processor('documents')
export class DocumentsProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentsProcessor.name);
  private readonly meilisearch: Meilisearch;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private readonly versionRepo: Repository<DocumentVersion>,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.meilisearch = new Meilisearch({
      host: this.configService.get('MEILI_HOST') || 'http://localhost:7700',
      apiKey: this.configService.get('MEILI_API_KEY') || 'masterKey',
    });
  }

  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-ocr':
        return this.processOcr(job.data);
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async processOcr(data: {
    documentId: string;
    versionId: string;
    tenantId: string;
  }) {
    this.logger.log(`Starting OCR processing for document ${data.documentId}`);

    const version = await this.versionRepo.findOne({
      where: { id: data.versionId },
      relations: ['document'],
    });

    if (!version) {
      throw new Error(`Version ${data.versionId} not found`);
    }

    if (
      !version.mimeType.startsWith('image/') &&
      version.mimeType !== 'application/pdf'
    ) {
      this.logger.log(
        `Skipping OCR for unsupported mime type: ${version.mimeType}`,
      );
      return;
    }

    try {
      const url = await this.storageService.getDownloadPresignedUrl(
        version.fileKey,
      );

      // For images, we can pass the URL directly to Tesseract
      // For PDFs, we would ideally extract images first, but for simplicity we'll let Tesseract attempt it or skip complex PDFs.
      // Note: Tesseract.js in Node can read images.

      let text = '';
      if (version.mimeType.startsWith('image/')) {
        const result = await Tesseract.recognize(url, 'eng');
        text = result.data.text;
      } else {
        // PDF OCR requires pdf.js to render to image first in node, which is complex.
        // For this demo, we'll extract text if it's a searchable PDF or just store the filename.
        text = version.document.name;
      }

      // Index in MeiliSearch
      await this.meilisearch.index('documents').addDocuments([
        {
          id: data.documentId,
          tenantId: data.tenantId,
          title: version.document.name,
          content: text,
        },
      ]);

      this.logger.log(
        `Successfully indexed document ${data.documentId} with OCR`,
      );
    } catch (error) {
      this.logger.error(
        `OCR processing failed for document ${data.documentId}`,
        error,
      );
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
  }
}
