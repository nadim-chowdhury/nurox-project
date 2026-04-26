import { Entity, Column, ManyToOne, OneToMany, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { User } from '../../users/entities/user.entity';
import { Document } from './document.entity';

@Entity('document_folders')
export class DocumentFolder extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @ManyToOne(() => DocumentFolder, (folder) => folder.children, {
    onDelete: 'CASCADE',
  })
  parent: DocumentFolder | null;

  @OneToMany(() => DocumentFolder, (folder) => folder.parent)
  children: DocumentFolder[];

  @OneToMany(() => Document, (doc) => doc.folder)
  documents: Document[];

  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User)
  owner: User;
}
