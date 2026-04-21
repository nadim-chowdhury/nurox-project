import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserPreferencesService } from './user-preferences.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums/permissions.enum';
import {
  updateUserSchema,
  inviteUserSchema,
  userListQuerySchema,
  UpdateUserDto,
  InviteUserDto,
  UserListQueryDto,
} from '@repo/shared-schemas';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly preferencesService: UserPreferencesService,
  ) {}

  @Get()
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users with pagination' })
  async findAll(@Query() query: UserListQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user full profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findByIdOrFail(userId);
  }

  @Get('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user preferences' })
  async getPreferences(@CurrentUser('id') userId: string) {
    return this.preferencesService.findAll(userId);
  }

  @Patch('preferences/:key')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set a user preference' })
  async setPreference(
    @CurrentUser('id') userId: string,
    @Param('key') key: string,
    @Body() body: { value: any },
  ) {
    return this.preferencesService.set(userId, key, body.value);
  }

  @Post('invite')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a new user' })
  async invite(@Body() body: InviteUserDto) {
    const parsed = inviteUserSchema.parse(body);
    return this.usersService.invite(parsed);
  }

  @Post('bulk')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create users from CSV data' })
  async bulkCreate(@Body() users: any[]) {
    return this.usersService.bulkCreate(users);
  }

  @Get('avatar-upload-url')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get presigned URL for avatar upload' })
  async getAvatarUploadUrl(
    @CurrentUser('id') userId: string,
    @Query('contentType') contentType: string,
  ) {
    return this.usersService.getAvatarUploadUrl(userId, contentType);
  }

  @Get(':id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findByIdOrFail(id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
  ) {
    const parsed = updateUserSchema.parse(body);
    return this.usersService.update(id, parsed);
  }

  @Delete(':id')
  @RequirePermissions(Permission.SYSTEM_ADMIN_ACCESS)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return { success: true };
  }
}
