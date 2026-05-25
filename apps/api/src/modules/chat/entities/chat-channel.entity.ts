import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum ChatChannelType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

@Entity('chat_channels')
export class ChatChannel extends TenantBaseEntity {
  @Column({ nullable: true })
  name: string | null;

  @Column({
    type: 'enum',
    enum: ChatChannelType,
    default: ChatChannelType.DIRECT,
  })
  type: ChatChannelType;

  // Array of user IDs participating in the channel
  @Column({ type: 'jsonb' })
  participants: string[];
}
