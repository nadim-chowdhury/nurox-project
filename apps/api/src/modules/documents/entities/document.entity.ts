import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { User } from '../../users/entities/user.entity';
import { DocumentFolder } from './document-folder.entity';
import { DocumentVersion } from './document-version.entity';

@Entity('documents')
export class Document extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  folderId: string | null;

  @ManyToOne(() => DocumentFolder, (folder) => folder.documents, { onDelete: 'SET NULL' })
  folder: DocumentFolder | null;

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User)
  owner: User;

  @OneToMany(() => DocumentVersion, (version) => version.document)
  versions: DocumentVersion[];

  @Column({ type: 'int', default: 1 })
  latestVersionNumber: number;

  @Column({ type: 'varchar', length: 50, default: 'PUBLIC' })
  accessControl: 'PUBLIC' | 'DEPARTMENT' | 'OWNER_ONLY' | 'ROLE_RESTRICTED';
}
