import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentFolder } from './entities/document-folder.entity';
import { StorageService } from '../system/storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepo: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private readonly versionRepo: Repository<DocumentVersion>,
    @InjectRepository(DocumentFolder)
    private readonly folderRepo: Repository<DocumentFolder>,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  async getUploadUrl(userId: string, tenantId: string, dto: { name: string; type?: string; folderId?: string }) {
    const key = `tenants/${tenantId}/documents/${Date.now()}-${dto.name}`;
    const uploadUrl = await this.storageService.getUploadPresignedUrl(key, dto.type || 'application/octet-stream');
    return { uploadUrl, key };
  }

  async createDocument(userId: string, tenantId: string, dto: { name: string; type: string; folderId?: string; fileKey: string; fileSize: number; mimeType: string }) {
    return await this.dataSource.transaction(async (manager) => {
      const doc = manager.create(Document, {
        name: dto.name,
        type: dto.type,
        folderId: dto.folderId,
        tenantId,
        ownerId: userId,
        latestVersionNumber: 1,
      });
      const savedDoc = await manager.save(doc);

      const version = manager.create(DocumentVersion, {
        documentId: savedDoc.id,
        versionNumber: 1,
        fileKey: dto.fileKey,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        createdByUserId: userId,
      });
      await manager.save(version);

      return savedDoc;
    });
  }

  async createVersion(userId: string, tenantId: string, documentId: string, dto: { fileKey: string; fileSize: number; mimeType: string; changeNotes?: string }) {
    const doc = await this.documentRepo.findOne({ where: { id: documentId, tenantId } });
    if (!doc) throw new NotFoundException('Document not found');

    return await this.dataSource.transaction(async (manager) => {
      const nextVersion = doc.latestVersionNumber + 1;
      
      const version = manager.create(DocumentVersion, {
        documentId: doc.id,
        versionNumber: nextVersion,
        fileKey: dto.fileKey,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        createdByUserId: userId,
        changeNotes: dto.changeNotes,
      });
      await manager.save(version);

      doc.latestVersionNumber = nextVersion;
      await manager.save(doc);

      return version;
    });
  }

  async getDownloadUrl(userId: string, tenantId: string, documentId: string, versionNumber?: number) {
    const doc = await this.documentRepo.findOne({ where: { id: documentId, tenantId } });
    if (!doc) throw new NotFoundException('Document not found');

    // Simple ownership check for now, can be expanded with PermissionsGuard logic
    if (doc.accessControl === 'OWNER_ONLY' && doc.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to download this document');
    }

    const version = await this.versionRepo.findOne({
      where: {
        documentId,
        versionNumber: versionNumber || doc.latestVersionNumber,
      },
    });

    if (!version) throw new NotFoundException('Document version not found');

    const downloadUrl = await this.storageService.getDownloadPresignedUrl(version.fileKey);
    return { downloadUrl };
  }

  async findAll(tenantId: string, folderId?: string) {
    return this.documentRepo.find({
      where: { tenantId, folderId },
      order: { createdAt: 'DESC' },
    });
  }

  async createFolder(userId: string, tenantId: string, dto: { name: string; parentId?: string }) {
    const folder = this.folderRepo.create({
      ...dto,
      tenantId,
      ownerId: userId,
    });
    return this.folderRepo.save(folder);
  }

  async findAllFolders(tenantId: string, parentId?: string) {
    return this.folderRepo.find({
      where: { tenantId, parentId },
      order: { name: 'ASC' },
    });
  }
}
