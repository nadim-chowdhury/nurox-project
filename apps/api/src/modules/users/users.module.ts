import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserPreference } from './entities/user-preference.entity';
import { UsersService } from './users.service';
import { UserPreferencesService } from './user-preferences.service';
import { UsersController } from './users.controller';
import { SystemModule } from '../system/system.module';
import { JwtModule } from '@nestjs/jwt';

import { UserDashboardWidget } from './entities/user-dashboard-widget.entity';
import { UserDashboardService } from './user-dashboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPreference, UserDashboardWidget]),
    SystemModule,
    JwtModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserPreferencesService, UserDashboardService],
  exports: [UsersService, UserPreferencesService, UserDashboardService],
})
export class UsersModule {}
