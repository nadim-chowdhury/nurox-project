import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollaborationService } from './collaboration.service';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationState } from './entities/collaboration-state.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CollaborationState, Document])],
  providers: [CollaborationService, CollaborationGateway],
  exports: [CollaborationService],
})
export class CollaborationModule {}
