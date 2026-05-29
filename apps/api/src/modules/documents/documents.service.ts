import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository, DataSource, Not, IsNull } from 'typeorm';
import * as puppeteer from 'puppeteer';
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
    @InjectQueue('documents')
    private readonly documentsQueue: Queue,
    private readonly storageService: StorageService,
    private readonly dataSource: DataSource,
  ) {}

  async getUploadUrl(
    userId: string,
    tenantId: string,
    dto: { name: string; type?: string; folderId?: string },
  ) {
    const key = `tenants/${tenantId}/documents/${Date.now()}-${dto.name}`;
    const uploadUrl = await this.storageService.getUploadPresignedUrl(
      key,
      dto.type || 'application/octet-stream',
    );
    return { uploadUrl, key };
  }

  async createDocument(
    userId: string,
    tenantId: string,
    dto: {
      name: string;
      type: string;
      folderId?: string;
      fileKey: string;
      fileSize: number;
      mimeType: string;
    },
  ) {
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

      await this.documentsQueue.add('process-ocr', {
        documentId: savedDoc.id,
        versionId: version.id,
        tenantId,
      });

      return savedDoc;
    });
  }

  async createVersion(
    userId: string,
    tenantId: string,
    documentId: string,
    dto: {
      fileKey: string;
      fileSize: number;
      mimeType: string;
      changeNotes?: string;
    },
  ) {
    const doc = await this.documentRepo.findOne({
      where: { id: documentId, tenantId },
    });
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

      await this.documentsQueue.add('process-ocr', {
        documentId: doc.id,
        versionId: version.id,
        tenantId,
      });

      return version;
    });
  }

  async getDownloadUrl(
    userId: string,
    tenantId: string,
    documentId: string,
    versionNumber?: number,
  ) {
    const doc = await this.documentRepo.findOne({
      where: { id: documentId, tenantId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    // Simple ownership check for now, can be expanded with PermissionsGuard logic
    if (doc.accessControl === 'OWNER_ONLY' && doc.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to download this document',
      );
    }

    const version = await this.versionRepo.findOne({
      where: {
        documentId,
        versionNumber: versionNumber || doc.latestVersionNumber,
      },
    });

    if (!version) throw new NotFoundException('Document version not found');

    const downloadUrl = await this.storageService.getDownloadPresignedUrl(
      version.fileKey,
    );
    return { downloadUrl };
  }

  async findAll(tenantId: string, folderId?: string) {
    return this.documentRepo.find({
      where: { tenantId, folderId },
      order: { createdAt: 'DESC' },
    });
  }

  async createFolder(
    userId: string,
    tenantId: string,
    dto: { name: string; parentId?: string },
  ) {
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

  async softDelete(tenantId: string, id: string) {
    const doc = await this.findOne(tenantId, id);
    if (!doc) throw new NotFoundException('Document not found');
    await this.documentRepo.softRemove(doc);
    return { success: true };
  }

  async restore(tenantId: string, id: string) {
    const doc = await this.documentRepo.findOne({
      where: { id, tenantId },
      withDeleted: true,
    });
    if (!doc || !doc.deletedAt)
      throw new NotFoundException('Deleted document not found');
    await this.documentRepo.recover(doc);
    return doc;
  }

  async getRecycleBin(tenantId: string) {
    return this.documentRepo.find({
      where: { tenantId, deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { deletedAt: 'DESC' },
    });
  }

  async signDocument(
    userId: string,
    tenantId: string,
    documentId: string,
    dto: { signatureBase64: string; signerName: string; ipAddress: string },
  ) {
    const doc = await this.findOne(tenantId, documentId);
    if (!doc) throw new NotFoundException('Document not found');

    const version = await this.versionRepo.findOne({
      where: { documentId, versionNumber: doc.latestVersionNumber },
    });
    if (!version) throw new NotFoundException('Document version not found');

    if (version.mimeType !== 'application/pdf') {
      throw new BadRequestException('Only PDF documents can be signed');
    }

    const signatures = doc.signatures || [];
    signatures.push({
      signerName: dto.signerName,
      signatureDate: new Date(),
      ipAddress: dto.ipAddress,
    });
    doc.signatures = signatures;

    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();

      const { downloadUrl } = await this.getDownloadUrl(
        userId,
        tenantId,
        documentId,
      );

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .audit-trail { border: 2px solid #000; padding: 20px; margin-top: 50px; }
            .signature { margin-top: 20px; }
            img { max-height: 100px; }
          </style>
        </head>
        <body>
          <h1>Certificate of Completion</h1>
          <p>Document ID: ${documentId}</p>
          <div class="audit-trail">
            <h3>Signatures Audit Trail</h3>
            ${signatures
              .map(
                (s) => `
              <div class="signature">
                <p><strong>Signed by:</strong> ${s.signerName}</p>
                <p><strong>Date:</strong> ${new Date(s.signatureDate).toLocaleString()}</p>
                <p><strong>IP Address:</strong> ${s.ipAddress}</p>
                ${s.signerName === dto.signerName ? `<img src="${dto.signatureBase64}" alt="Signature" />` : '[Signature on File]'}
              </div>
            `,
              )
              .join('')}
          </div>
        </body>
        </html>
      `;

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

      const key = `tenants/${tenantId}/documents/${Date.now()}-signed-${doc.name}`;
      await this.storageService.uploadBuffer(
        key,
        Buffer.from(pdfBuffer),
        'application/pdf',
      );

      const nextVersion = doc.latestVersionNumber + 1;
      const newVersion = this.versionRepo.create({
        documentId: doc.id,
        versionNumber: nextVersion,
        fileKey: key,
        fileSize: pdfBuffer.length,
        mimeType: 'application/pdf',
        createdByUserId: userId,
        changeNotes: `Signed by ${dto.signerName}`,
      });
      await this.versionRepo.save(newVersion);

      doc.latestVersionNumber = nextVersion;
      await this.documentRepo.save(doc);

      return { success: true, version: newVersion };
    } finally {
      await browser.close();
    }
  }

  private async findOne(tenantId: string, id: string) {
    return this.documentRepo.findOne({
      where: { id, tenantId },
    });
  }
}
