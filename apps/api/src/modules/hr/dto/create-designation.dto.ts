import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateDesignationDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(8)
  level?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
