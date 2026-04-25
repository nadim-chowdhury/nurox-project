import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('login_events')
export class LoginEvent extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User | null;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceType: string | null;

  @Column({
    type: 'enum',
    enum: ['SUCCESS', 'FAILED', 'LOCKED'],
    default: 'SUCCESS',
  })
  result: 'SUCCESS' | 'FAILED' | 'LOCKED';

  @Column({ type: 'varchar', length: 255, nullable: true })
  failureReason: string | null;
}
