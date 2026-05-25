import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../common/entities/tenant-base.entity';

export enum CustomFieldType {
  VARCHAR = 'VARCHAR',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  DROPDOWN = 'DROPDOWN',
}

@Entity('custom_field_definitions')
export class CustomFieldDefinition extends TenantBaseEntity {
  @Column({ type: 'varchar', length: 100 })
  entityName: string; // e.g., 'Employee', 'Invoice'

  @Column({ type: 'varchar', length: 100 })
  name: string; // Field label

  @Column({ type: 'varchar', length: 100 })
  key: string; // Field key, e.g., 'bloodGroup'

  @Column({ type: 'enum', enum: CustomFieldType })
  type: CustomFieldType;

  @Column({ type: 'simple-array', nullable: true })
  options: string[]; // Options if type is DROPDOWN

  @Column({ type: 'boolean', default: false })
  isRequired: boolean;
}
