import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { WebhookConfig } from './webhook-config.entity';

@Entity('webhook_deliveries')
export class WebhookDelivery extends TenantBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  webhookConfigId: string;

  @ManyToOne(() => WebhookConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'webhookConfigId' })
  config: WebhookConfig;

  @Column({ type: 'varchar', length: 100 })
  event: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'jsonb', nullable: true })
  responseBody: any;

  @Column({ type: 'int', nullable: true })
  statusCode: number | null;

  @Column({ type: 'int', default: 1 })
  attempt: number;

  @Column({ type: 'boolean', default: false })
  isSuccess: boolean;

  @Column({ type: 'text', nullable: true })
  error: string | null;
}
