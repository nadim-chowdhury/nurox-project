import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsProcessor } from './documents.processor';
import { Document } from './entities/document.entity';
import { DocumentFolder } from './entities/document-folder.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { SystemModule } from '../system/system.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentFolder, DocumentVersion]),
    BullModule.registerQueue({
      name: 'documents',
    }),
    SystemModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsProcessor],
  exports: [DocumentsService],
})
export class DocumentsModule {}
