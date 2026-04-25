import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * User entity — the core identity in the system.
 * Every employee, admin, and manager maps to a User row.
 *
 * Password is stored as bcrypt hash (saltRounds=12).
 * Refresh token hash is stored for rotation + family invalidation.
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: [
      'SUPER_ADMIN',
      'ADMIN',
      'HR_MANAGER',
      'FINANCE_MANAGER',
      'INVENTORY_MANAGER',
      'SALES_MANAGER',
      'PROJECT_MANAGER',
      'EMPLOYEE',
    ],
    default: 'EMPLOYEE',
  })
  role: string;

  @Column({
    type: 'enum',
    enum: [
      'ACTIVE',
      'INACTIVE',
      'SUSPENDED',
      'PENDING_VERIFICATION',
      'PENDING_INVITE',
    ],
    default: 'PENDING_VERIFICATION',
  })
  status: string;

  @Column({ type: 'boolean', default: false })
  forcePasswordChange: boolean;

  @Column({ type: 'uuid', nullable: true })
  branchId: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  emailVerificationTokenHash: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  emailVerificationExpires: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  refreshTokenHash: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  twoFactorSecret: string | null;

  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'text', nullable: true, select: false })
  twoFactorBackupCodes: string | null; // JSON string of hashed backup codes

  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  resetPasswordTokenHash: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  resetPasswordExpires: Date | null;
}
