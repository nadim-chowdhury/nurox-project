import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseGuards,
  Req,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentLog } from './entities/consent-log.entity';
import archiver from 'archiver';

@ApiTags('GDPR & Compliance')
@Controller('admin/gdpr')
export class GdprController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(ConsentLog)
    private readonly consentLogRepo: Repository<ConsentLog>,
  ) {}

  @Get('export/:userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export user data (GDPR Right of Access)' })
  async exportUserData(@Param('userId') userId: string, @Res() res: Response) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare JSON payload representing user data
    // In a real application, this would join data across multiple modules (payroll, attendance, etc.)
    const userData = {
      profile: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
      },
      // Mocked additional data references
      attendance: 'See separate CSV (not fully implemented in this demo)',
      payroll: 'See separate CSV (not fully implemented in this demo)',
    };

    res.attachment(`gdpr-export-${user.id}.zip`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    archive.append(JSON.stringify(userData, null, 2), {
      name: 'user-profile.json',
    });

    await archive.finalize();
  }

  @Post('erase/:userId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Anonymize user PII (GDPR Right to Erasure)' })
  async eraseUserData(@Param('userId') userId: string) {
    // We do NOT hard delete to maintain foreign key constraints on financial/HR records
    // Instead we anonymize PII

    await this.usersService.update(userId, {
      firstName: '[DELETED]',
      lastName: '[DELETED]',
      email: `deleted-${userId}@anonymized.local`,
      phone: null,
      status: 'INACTIVE',
      avatarUrl: null,
    });

    return {
      success: true,
      message: 'User PII has been successfully anonymized.',
    };
  }

  @Post('consent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record user consent event' })
  async recordConsent(
    @Req() req: any,
    @Body() body: { consentType: string; granted: boolean },
  ) {
    const log = this.consentLogRepo.create({
      tenantId: req.tenantId,
      userId: req.user.id,
      consentType: body.consentType,
      granted: body.granted,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    return this.consentLogRepo.save(log);
  }
}
