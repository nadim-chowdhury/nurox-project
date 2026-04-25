import { IsUUID, IsNumber, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { RevisionStatus } from '../entities/salary-revision.entity';

export class CreateSalaryRevisionDto {
  @IsUUID()
  employeeId: string;

  @IsNumber()
  proposedSalary: number;

  @IsUUID()
  @IsOptional()
  proposedDesignationId?: string;

  @IsUUID()
  @IsOptional()
  proposedGradeId?: string;

  @IsDateString()
  effectiveDate: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class UpdateSalaryRevisionStatusDto {
  @IsEnum(RevisionStatus)
  status: RevisionStatus;

  @IsString()
  @IsOptional()
  comments?: string;
}
