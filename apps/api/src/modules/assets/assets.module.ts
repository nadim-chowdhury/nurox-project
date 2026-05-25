import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { Asset } from './entities/asset.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { AssetAssignment } from './entities/asset-assignment.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import { AssetsProcessor } from './assets.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Asset,
      AssetCategory,
      AssetAssignment,
      AssetMaintenance,
    ]),
    BullModule.registerQueue({
      name: 'assets',
    }),
  ],
  providers: [AssetsService, AssetsProcessor],
  controllers: [AssetsController],
  exports: [AssetsService],
})
export class AssetsModule {}
