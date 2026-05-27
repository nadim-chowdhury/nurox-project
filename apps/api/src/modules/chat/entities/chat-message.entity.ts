import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';
import { ChatChannel } from './chat-channel.entity';
import { User } from '../../users/entities/user.entity';

@Entity('chat_messages')
export class ChatMessage extends TenantBaseEntity {
  @Column({ name: 'channel_id', type: 'uuid' })
  @Index()
  channelId: string;

  @ManyToOne(() => ChatChannel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: ChatChannel;

  @Column({ name: 'sender_id', type: 'uuid' })
  @Index()
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'text' })
  content: string;

  // Store mentioned user IDs
  @Column({ type: 'jsonb', nullable: true })
  mentions: string[] | null;
}
