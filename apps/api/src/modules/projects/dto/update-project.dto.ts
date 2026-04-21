import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
