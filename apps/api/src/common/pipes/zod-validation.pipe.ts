import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

/**
 * NestJS pipe that validates request data against a Zod schema.
 * Replaces class-validator decorators with shared Zod schemas from @repo/shared-schemas.
 *
 * Usage:
 *   @Post()
 *   create(@Body(new ZodValidationPipe(createEmployeeSchema)) dto: CreateEmployeeDto) {}
 *
 * Or as a global pipe:
 *   app.useGlobalPipes(new ZodValidationPipe(schema));
 */
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      throw new BadRequestException({
        statusCode: 400,
        code: 1900,
        message: 'Validation failed',
        errors,
      });
    }

    return result.data;
  }
}
