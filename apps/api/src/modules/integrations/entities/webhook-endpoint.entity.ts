import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('webhook_endpoints')
export class WebhookEndpoint extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'simple-array' })
  events: string[]; // e.g. ['employee.created', 'invoice.paid']

  @Column({ type: 'varchar', length: 255, nullable: true })
  secret: string; // Used for HMAC-SHA256 signatures

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
