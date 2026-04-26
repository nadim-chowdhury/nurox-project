import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { TransferStatus } from '../entities/transfer-request.entity';

export class CreateTransferRequestDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  newDepartmentId: string;

  @IsUUID()
  newBranchId: string;

  @IsDateString()
  effectiveDate: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateTransferStatusDto {
  @IsEnum(TransferStatus)
  status: TransferStatus;

  @IsString()
  @IsOptional()
  comments?: string;
}
