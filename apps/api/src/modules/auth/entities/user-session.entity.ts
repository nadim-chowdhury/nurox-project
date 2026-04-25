import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

/**
 * UserSession entity tracks active refresh tokens and device metadata.
 * Enables:
 * - Session lists (Active Devices)
 * - Individual session revocation
 * - Refresh token rotation family tracking
 */
@Entity('user_sessions')
export class UserSession extends BaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255, select: false })
  refreshTokenHash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType: string | null; // e.g. 'mobile', 'desktop', 'tablet'

  @Index()
  @Column({ type: 'varchar', length: 64, nullable: true })
  familyId: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastActiveAt: Date;

  @Column({ type: 'boolean', default: false })
  isTwoFactorAuthenticated: boolean;
}
