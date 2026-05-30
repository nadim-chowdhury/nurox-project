import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { spawn } from 'child_process';
import { StorageService } from '../storage.service';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

@Processor('database-backup')
export class DatabaseBackupProcessor extends WorkerHost {
  private readonly logger = new Logger(DatabaseBackupProcessor.name);

  constructor(private readonly storageService: StorageService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Starting database backup job ${job.id}`);

    // Read connection info from environment
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = process.env.DB_PORT || '5432';
    const dbUser = process.env.DB_USERNAME || 'postgres';
    const dbName = process.env.DB_DATABASE || 'nurox_db';
    const dbPass = process.env.DB_PASSWORD || '';

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `db-backup-${timestamp}.sql.gz`;
    const tempFilePath = path.join(os.tmpdir(), filename);

    return new Promise((resolve, reject) => {
      // We pipe pg_dump to gzip to compress it
      const pgDump = spawn(
        'pg_dump',
        [
          '-h',
          dbHost,
          '-p',
          dbPort,
          '-U',
          dbUser,
          '-d',
          dbName,
          '-F',
          'p', // plain text
        ],
        {
          env: { ...process.env, PGPASSWORD: dbPass },
        },
      );

      const gzip = spawn('gzip', []);
      const fileStream = fs.createWriteStream(tempFilePath);

      pgDump.stdout.pipe(gzip.stdin);
      gzip.stdout.pipe(fileStream);

      pgDump.stderr.on('data', (data) => {
        this.logger.warn(`pg_dump stderr: ${data.toString()}`);
      });

      pgDump.on('error', (err) => {
        this.logger.error(
          `Failed to start pg_dump. Is it installed? ${err.message}`,
        );
        reject(err);
      });

      gzip.on('close', (code) => {
        void (async () => {
          if (code !== 0) {
            reject(new Error(`gzip process exited with code ${code}`));
            return;
          }

          this.logger.log(
            `Backup created locally at ${tempFilePath}. Uploading to storage...`,
          );

          try {
            const fileBuffer = await fs.promises.readFile(tempFilePath);
            const key = `backups/${filename}`;
            const uploadResultUrl = await this.storageService.uploadBuffer(
              key,
              fileBuffer,
              'application/gzip',
            );

            this.logger.log(`Backup uploaded successfully: ${uploadResultUrl}`);

            await fs.promises.unlink(tempFilePath);

            resolve(uploadResultUrl);
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Failed to upload backup: ${err.message}`);
            reject(err);
          }
        })();
      });
    });
  }
}
