import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('webhook_delivery_logs')
export class WebhookDeliveryLog extends TenantBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  endpointId: string;

  @Column({ type: 'varchar', length: 255 })
  event: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ type: 'int', default: 1 })
  attempt: number;
}
