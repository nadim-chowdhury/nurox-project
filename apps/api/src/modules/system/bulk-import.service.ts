import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as csv from 'csv-parser';

@Injectable()
export class BulkImportService {
  private readonly logger = new Logger(BulkImportService.name);

  constructor(@InjectQueue('system') private readonly systemQueue: Queue) {}

  /**
   * Process a large CSV file by reading it as a stream, breaking it into chunks,
   * and pushing those chunks into a BullMQ queue for background processing.
   */
  async queueImportFromCsv(
    filePath: string,
    entityType: string,
    tenantId: string,
  ): Promise<string> {
    const jobId = `import_${entityType}_${Date.now()}`;
    const CHUNK_SIZE = 500;
    let chunk: any[] = [];
    let chunkIndex = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe((csv as any)())
        .on('data', (data) => {
          chunk.push(data);
          if (chunk.length >= CHUNK_SIZE) {
            // Push chunk to queue and clear local chunk
            this.systemQueue.add('bulk_import_chunk', {
              jobId,
              tenantId,
              entityType,
              chunkIndex: chunkIndex++,
              records: chunk,
            });
            chunk = [];
          }
        })
        .on('end', async () => {
          // Push any remaining records
          if (chunk.length > 0) {
            await this.systemQueue.add('bulk_import_chunk', {
              jobId,
              tenantId,
              entityType,
              chunkIndex: chunkIndex++,
              records: chunk,
            });
          }

          // Optionally, add a finalize job to mark the import as complete
          await this.systemQueue.add('bulk_import_finalize', {
            jobId,
            tenantId,
            entityType,
            totalChunks: chunkIndex,
          });

          this.logger.log(
            `Queued bulk import for ${entityType} (Job ID: ${jobId}, Chunks: ${chunkIndex})`,
          );

          // Clean up the temp file
          fs.unlink(filePath, (err) => {
            if (err)
              this.logger.error(`Failed to delete temp file ${filePath}`, err);
          });

          resolve(jobId);
        })
        .on('error', (err) => {
          this.logger.error(`Error streaming CSV file ${filePath}`, err);
          reject(err);
        });
    });
  }
}
