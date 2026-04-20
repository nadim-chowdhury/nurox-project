import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 * Abstract base entity with UUID primary key and audit timestamps.
 * All domain entities extend this.
 *
 * - `id`: UUID v4, auto-generated
 * - `createdAt`: Set once on insert
 * - `updatedAt`: Auto-updates on every save
 * - `deletedAt`: Soft delete — null when active, timestamp when deleted
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
