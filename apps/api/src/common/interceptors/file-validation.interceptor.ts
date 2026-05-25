import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

// File-type is ESM, so we use dynamic import
// Or use the commonjs version we installed (16.5.4)
import { fromBuffer } from 'file-type';

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();

    // multer puts files in req.file or req.files
    const file = (request as any).file;
    const files = (request as any).files;

    if (file) {
      await this.validateFile(file);
    }

    if (files) {
      if (Array.isArray(files)) {
        for (const f of files) {
          await this.validateFile(f);
        }
      } else {
        for (const key in files) {
          for (const f of files[key]) {
            await this.validateFile(f);
          }
        }
      }
    }

    return next.handle();
  }

  private async validateFile(file: any) {
    if (!file.buffer) return;

    // Check file size (e.g., max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException(
        `File ${file.originalname} exceeds 10MB size limit.`,
      );
    }

    // Check magic bytes using file-type
    const type = await fromBuffer(file.buffer);

    // If it's a known format but missing magic bytes, reject it
    // CSV doesn't have a reliable magic byte (often returns undefined)
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv') {
      // Allow CSV based on mimetype, but ensure it's not actually an executable
      if (type && type.mime.startsWith('application/x-')) {
        throw new BadRequestException('Invalid CSV file signature detected.');
      }
    } else {
      // For other types like images, PDFs, verify it matches
      if (!type) {
        throw new BadRequestException(
          `Unable to verify file type for ${file.originalname}`,
        );
      }

      if (!type.mime.startsWith(file.mimetype.split('/')[0])) {
        // E.g., image/jpeg might be detected as image/png, but at least both are images
        throw new BadRequestException(
          `File magic bytes do not match expected mimetype for ${file.originalname}`,
        );
      }
    }
  }
}
