import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { Document } from '../../documents/entities/document.entity';

@Entity('collaboration_states')
export class CollaborationState extends TenantBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  document: Document;

  @Column({ type: 'bytea', nullable: true })
  stateVector: Buffer;

  @Column({ type: 'bytea', nullable: true })
  content: Buffer; // The full Yjs document state as a binary blob

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastSavedAt: Date;
}
