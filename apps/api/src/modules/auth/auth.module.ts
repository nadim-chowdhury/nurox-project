import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';
import { AuthController } from './auth.controller';
import { RolesController } from './roles.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { UsersModule } from '../users/users.module';
import { MailerModule } from '../mailer/mailer.module';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';
import { LoginEvent } from './entities/login-event.entity';
import { Role } from './entities/role.entity';
import { Membership } from './entities/membership.entity';
import { PermissionsGuard } from './guards/permissions.guard';

@Global()
@Module({
  imports: [
    UsersModule,
    MailerModule,
    TypeOrmModule.forFeature([UserSession, LoginEvent, Role, Membership]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.accessSecret')!,
        signOptions: {
          expiresIn: config.get<string>('jwt.accessExpiry')! as any,
        },
      }),
    }),
  ],
  controllers: [AuthController, RolesController],
  providers: [
    AuthService,
    RolesService,
    JwtStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    PermissionsGuard,
  ],
  exports: [AuthService, RolesService, PermissionsGuard, TypeOrmModule],
})
export class AuthModule {}
