import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { User } from '../../users/entities/user.entity';
import { Document } from './document.entity';

@Entity('document_versions')
export class DocumentVersion extends TenantBaseEntity {
  @Column({ type: 'uuid' })
  documentId: string;

  @ManyToOne(() => Document, (doc) => doc.versions, { onDelete: 'CASCADE' })
  document: Document;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ type: 'varchar', length: 500 })
  fileKey: string;

  @Column({ type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'uuid' })
  createdByUserId: string;

  @ManyToOne(() => User)
  createdByUser: User;

  @Column({ type: 'text', nullable: true })
  changeNotes: string | null;
}
