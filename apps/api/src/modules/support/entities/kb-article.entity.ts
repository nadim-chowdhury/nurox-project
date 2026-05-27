import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('kb_articles')
export class KbArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  tenantId: string;

  @ManyToOne(() => Tenant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  category: string;

  @Column({ default: 'DRAFT' })
  status: string;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ type: 'uuid' })
  authorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
