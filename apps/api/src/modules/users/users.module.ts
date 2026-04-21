import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserPreference } from './entities/user-preference.entity';
import { UsersService } from './users.service';
import { UserPreferencesService } from './user-preferences.service';
import { UsersController } from './users.controller';
import { SystemModule } from '../system/system.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserPreference]),
    SystemModule,
    JwtModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserPreferencesService],
  exports: [UsersService, UserPreferencesService],
})
export class UsersModule {}
