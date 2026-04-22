import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Get a pre-signed URL for document upload' })
  @RequirePermissions(Permission.DOCUMENT_WRITE)
  async getUploadUrl(@Req() req: any, @Body() dto: { name: string; type?: string; folderId?: string }) {
    return this.documentsService.getUploadUrl(req.user.id, req.tenantId, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new document after upload' })
  @RequirePermissions(Permission.DOCUMENT_WRITE)
  async createDocument(@Req() req: any, @Body() dto: any) {
    return this.documentsService.createDocument(req.user.id, req.tenantId, dto);
  }

  @Post(':id/version')
  @ApiOperation({ summary: 'Create a new version for a document' })
  @RequirePermissions(Permission.DOCUMENT_WRITE)
  async createVersion(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.documentsService.createVersion(req.user.id, req.tenantId, id, dto);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get a pre-signed URL for document download' })
  @RequirePermissions(Permission.DOCUMENT_READ)
  async getDownloadUrl(@Req() req: any, @Param('id') id: string, @Query('version') version?: number) {
    return this.documentsService.getDownloadUrl(req.user.id, req.tenantId, id, version);
  }

  @Get()
  @ApiOperation({ summary: 'List all documents in a folder' })
  @RequirePermissions(Permission.DOCUMENT_READ)
  async findAll(@Req() req: any, @Query('folderId') folderId?: string) {
    return this.documentsService.findAll(req.tenantId, folderId);
  }

  @Post('folders')
  @ApiOperation({ summary: 'Create a new folder' })
  @RequirePermissions(Permission.DOCUMENT_WRITE)
  async createFolder(@Req() req: any, @Body() dto: { name: string; parentId?: string }) {
    return this.documentsService.createFolder(req.user.id, req.tenantId, dto);
  }

  @Get('folders')
  @ApiOperation({ summary: 'List all folders in a parent folder' })
  @RequirePermissions(Permission.DOCUMENT_READ)
  async findAllFolders(@Req() req: any, @Query('parentId') parentId?: string) {
    return this.documentsService.findAllFolders(req.tenantId, parentId);
  }
}
