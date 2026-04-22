import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { AssetCategory } from './entities/asset-category.entity';
import { AssetAssignment } from './entities/asset-assignment.entity';
import { AssetMaintenance } from './entities/asset-maintenance.entity';
import {
  CreateAssetDto,
  UpdateAssetDto,
  CreateAssetCategoryDto,
  AssignAssetDto,
  CreateAssetMaintenanceDto,
  DisposeAssetDto,
} from '@repo/shared-schemas';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    @InjectRepository(AssetCategory)
    private readonly categoryRepo: Repository<AssetCategory>,
    @InjectRepository(AssetAssignment)
    private readonly assignmentRepo: Repository<AssetAssignment>,
    @InjectRepository(AssetMaintenance)
    private readonly maintenanceRepo: Repository<AssetMaintenance>,
    private readonly dataSource: DataSource,
  ) {}

  async createCategory(tenantId: string, dto: CreateAssetCategoryDto) {
    const category = this.categoryRepo.create({
      ...dto,
      tenantId,
    });
    return this.categoryRepo.save(category);
  }

  async findAllCategories(tenantId: string) {
    return this.categoryRepo.find({ where: { tenantId } });
  }

  async createAsset(tenantId: string, dto: CreateAssetDto) {
    const asset = this.assetRepo.create({
      ...dto,
      tenantId,
      status: 'PURCHASED',
    });
    return this.assetRepo.save(asset);
  }

  async findAllAssets(tenantId: string, query?: any) {
    return this.assetRepo.find({
      where: { tenantId, ...query },
      relations: ['category', 'assignedEmployee'],
    });
  }

  async findOneAsset(tenantId: string, id: string) {
    const asset = await this.assetRepo.findOne({
      where: { id, tenantId },
      relations: ['category', 'assignedEmployee', 'assignments', 'maintenances'],
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async updateAsset(tenantId: string, id: string, dto: UpdateAssetDto) {
    const asset = await this.findOneAsset(tenantId, id);
    Object.assign(asset, dto);
    return this.assetRepo.save(asset);
  }

  async assignAsset(tenantId: string, id: string, dto: AssignAssetDto) {
    const asset = await this.findOneAsset(tenantId, id);
    
    return await this.dataSource.transaction(async (manager) => {
      // Create assignment record
      const assignment = manager.create(AssetAssignment, {
        assetId: id,
        employeeId: dto.employeeId,
        assignmentDate: new Date(dto.assignmentDate),
        notes: dto.notes,
      });
      await manager.save(assignment);

      // Update asset status and assignee
      asset.assignedEmployeeId = dto.employeeId;
      asset.status = 'ACTIVE';
      await manager.save(asset);

      return assignment;
    });
  }

  async returnAsset(tenantId: string, id: string, returnDate: string) {
    const asset = await this.findOneAsset(tenantId, id);
    if (!asset.assignedEmployeeId) return asset;

    return await this.dataSource.transaction(async (manager) => {
      // Find active assignment
      const assignment = await manager.findOne(AssetAssignment, {
        where: { assetId: id, employeeId: asset.assignedEmployeeId!, returnDate: null },
      });

      if (assignment) {
        assignment.returnDate = new Date(returnDate);
        await manager.save(assignment);
      }

      asset.assignedEmployeeId = null;
      // Keep as ACTIVE or set back to PURCHASED? Usually ACTIVE if ready for next assignment
      await manager.save(asset);

      return asset;
    });
  }

  async addMaintenance(tenantId: string, id: string, dto: CreateAssetMaintenanceDto) {
    const asset = await this.findOneAsset(tenantId, id);
    
    const maintenance = this.maintenanceRepo.create({
      ...dto,
      assetId: id,
      maintenanceDate: new Date(dto.maintenanceDate),
      nextMaintenanceDate: dto.nextMaintenanceDate ? new Date(dto.nextMaintenanceDate) : null,
    });

    return await this.maintenanceRepo.save(maintenance);
  }

  async disposeAsset(tenantId: string, id: string, dto: DisposeAssetDto) {
    const asset = await this.findOneAsset(tenantId, id);
    
    asset.status = 'DISPOSED';
    asset.disposalDate = new Date(dto.disposalDate);
    asset.disposalPrice = dto.disposalPrice;
    asset.disposalReason = dto.disposalReason;
    asset.assignedEmployeeId = null;

    return this.assetRepo.save(asset);
  }
}
