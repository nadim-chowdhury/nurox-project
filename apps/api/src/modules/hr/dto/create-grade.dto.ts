import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateGradeDto {
  @ApiProperty({ example: 'G1', description: 'Name of the grade' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Level of seniority (higher is more senior)',
  })
  @IsNumber()
  @Min(1)
  level: number;

  @ApiProperty({ example: 50000, description: 'Minimum salary for this grade' })
  @IsNumber()
  @Min(0)
  minSalary: number;

  @ApiProperty({ example: 80000, description: 'Maximum salary for this grade' })
  @IsNumber()
  @Min(0)
  maxSalary: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
