import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Server } from '@hocuspocus/server';
import { TiptapTransformer } from '@hocuspocus/transformer';
import { CollaborationState } from './entities/collaboration-state.entity';
import { Document } from '../documents/entities/document.entity';
import * as Y from 'yjs';

@Injectable()
export class CollaborationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CollaborationService.name);
  public hocuspocusServer: Server;

  constructor(
    @InjectRepository(CollaborationState)
    private readonly stateRepo: Repository<CollaborationState>,
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
  ) {}

  onModuleInit() {
    this.hocuspocusServer = new Server({
      name: 'nurox-collaboration',
      port: 3002, // Collaboration dedicated port or handled via gateway

      async onConnect() {
        this.logger.log('New collaboration connection');
      },

      async onLoadDocument(data) {
        const { documentName } = data; // documentName is the documentId
        const state = await this.stateRepo.findOne({
          where: { documentId: documentName },
        });

        if (state && state.content) {
          const doc = new Y.Doc();
          Y.applyUpdate(doc, new Uint8Array(state.content));
          return doc;
        }

        return new Y.Doc();
      },

      async onStoreDocument(data) {
        const { documentName, document } = data;
        const stateVector = Y.encodeStateVector(document);
        const content = Y.encodeStateAsUpdate(document);

        let state = await this.stateRepo.findOne({
          where: { documentId: documentName },
        });

        if (!state) {
          // In a real app, we'd need the tenantId here.
          // Hocuspocus context can provide it if passed during connection.
          // For now, let's assume we find the document to get the tenantId.
          const docEntity = await this.documentRepo.findOne({
            where: { id: documentName },
          });
          if (!docEntity) return;

          state = this.stateRepo.create({
            documentId: documentName,
            tenantId: docEntity.tenantId,
          });
        }

        state.stateVector = Buffer.from(stateVector);
        state.content = Buffer.from(content);
        state.lastSavedAt = new Date();

        await this.stateRepo.save(state);
      },
    });

    this.logger.log('Hocuspocus Collaboration Server Configured');
  }

  onModuleDestroy() {
    if (this.hocuspocusServer) {
      this.hocuspocusServer.destroy();
    }
  }

  // Helper to convert Yjs binary to Tiptap JSON (useful for exports/previews)
  getYjsAsJson(binary: Buffer) {
    const doc = new Y.Doc();
    Y.applyUpdate(doc, new Uint8Array(binary));
    return TiptapTransformer.fromYdoc(doc);
  }
}
