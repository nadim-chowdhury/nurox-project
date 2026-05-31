import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('search_queries')
export class SearchQuery extends TenantBaseEntity {
  @Column()
  @Index()
  query: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ default: 0 })
  resultsCount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ type: 'jsonb', nullable: true })
  clickedResults: string[]; // List of entity IDs clicked
}
