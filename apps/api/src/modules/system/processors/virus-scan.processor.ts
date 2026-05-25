import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface VirusScanJobData {
  filePath: string;
  originalFilename: string;
}

@Processor('virus-scan')
export class VirusScanProcessor extends WorkerHost {
  private readonly logger = new Logger(VirusScanProcessor.name);

  async process(job: Job<VirusScanJobData, any, string>): Promise<any> {
    const { filePath, originalFilename } = job.data;

    this.logger.log(`Scanning file: ${originalFilename}`);

    // Simulate ClamAV scan (Wait 2 seconds)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock logic: If filename contains 'eicar' or 'virus', quarantine it
    if (
      originalFilename.toLowerCase().includes('virus') ||
      originalFilename.toLowerCase().includes('eicar')
    ) {
      this.logger.warn(`Virus detected in file: ${originalFilename}`);

      // Quarantine file
      const quarantineDir = path.join(process.cwd(), 'quarantine');
      if (!fs.existsSync(quarantineDir)) {
        fs.mkdirSync(quarantineDir, { recursive: true });
      }
      const quarantinePath = path.join(quarantineDir, path.basename(filePath));

      try {
        fs.renameSync(filePath, quarantinePath);
        this.logger.log(`File moved to quarantine: ${quarantinePath}`);
      } catch (err) {
        this.logger.error(`Failed to quarantine file: ${err.message}`);
      }

      return { safe: false, quarantined: true };
    }

    this.logger.log(`File is safe: ${originalFilename}`);
    return { safe: true, quarantined: false };
  }
}
