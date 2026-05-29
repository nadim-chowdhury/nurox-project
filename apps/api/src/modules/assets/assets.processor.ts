import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';

@Processor('assets')
@Injectable()
export class AssetsProcessor extends WorkerHost {
  private readonly logger = new Logger(AssetsProcessor.name);

  constructor(
    private readonly assetsService: AssetsService,
    @InjectRepository(Asset) private readonly assetRepo: Repository<Asset>,
    @InjectRepository(AssetMaintenance)
    private readonly maintenanceRepo: Repository<AssetMaintenance>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case 'depreciation-run':
        return this.handleDepreciationRun(job.data);
      case 'warranty-expiry-check':
        return this.handleWarrantyExpiryCheck();
      case 'maintenance-trigger':
        return this.handleMaintenanceTrigger();
      default:
        this.logger.warn(`Unknown job type: ${job.name}`);
    }
  }

  private async handleDepreciationRun(data: { tenantId: string }) {
    this.logger.log('Starting monthly depreciation run...');
    // Find all active assets that use SL or DB depreciation
    const assets = await this.assetRepo.find({
      where: [
        { status: 'ACTIVE', depreciationMethod: 'SL' },
        { status: 'ACTIVE', depreciationMethod: 'DB' },
        { status: 'ACTIVE', depreciationMethod: 'UOP' },
      ],
    });

    for (const asset of assets) {
      try {
        await this.assetsService.calculateDepreciation(
          asset.tenantId,
          asset.id,
          1,
        );
        this.logger.debug(
          `Calculated depreciation for asset ${asset.assetCode}`,
        );
      } catch (err) {
        this.logger.error(
          `Failed to calculate depreciation for asset ${asset.id}`,
          err,
        );
      }
    }
    return { processed: assets.length };
  }

  private async handleWarrantyExpiryCheck() {
    this.logger.log('Checking for warranty expiries...');
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringAssets = await this.assetRepo.find({
      where: {
        warrantyExpiry: LessThanOrEqual(thirtyDaysFromNow),
        status: 'ACTIVE',
      },
    });

    for (const asset of expiringAssets) {
      // In a real scenario, this would dispatch an email/notification
      this.logger.debug(
        `Warranty for asset ${asset.assetCode} is expiring soon!`,
      );
    }
    return { flagged: expiringAssets.length };
  }

  private async handleMaintenanceTrigger() {
    this.logger.log('Triggering scheduled maintenance tasks...');
    const today = new Date();

    const dueMaintenances = await this.maintenanceRepo.find({
      where: {
        nextMaintenanceDate: LessThanOrEqual(today),
      },
      relations: ['asset'],
    });

    for (const maintenance of dueMaintenances) {
      this.logger.debug(
        `Asset ${maintenance.asset?.assetCode} is due for maintenance based on schedule.`,
      );
    }
    return { triggered: dueMaintenances.length };
  }
}
