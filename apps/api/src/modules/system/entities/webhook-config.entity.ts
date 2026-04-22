import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('webhook_configs')
export class WebhookConfig extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255, select: false })
  secret: string; // Used for HMAC-SHA256 signing

  @Column({ type: 'jsonb' })
  events: string[]; // e.g., ['employee.created', 'invoice.paid']

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, string> | null; // Custom headers for the request
}
