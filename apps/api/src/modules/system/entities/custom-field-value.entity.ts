import { Entity, Column, Index } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

@Entity('custom_field_values')
export class CustomFieldValue extends TenantBaseEntity {
  @Index()
  @Column({ type: 'uuid' })
  definitionId: string; // FK to CustomFieldDefinition

  @Index()
  @Column({ type: 'varchar', length: 100 })
  entityName: string; // e.g., 'Employee'

  @Index()
  @Column({ type: 'uuid' })
  entityId: string; // ID of the actual record

  @Column({ type: 'text', nullable: true })
  valueString: string | null;

  @Column({ type: 'float', nullable: true })
  valueNumber: number | null;

  @Column({ type: 'boolean', nullable: true })
  valueBoolean: boolean | null;

  @Column({ type: 'date', nullable: true })
  valueDate: Date | null;
}
