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
// SAML strategies are disabled until passport-saml packages are installed.
// import { GoogleSamlStrategy } from './strategies/google-saml.strategy';
// import { SamlStrategy } from './strategies/saml.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { MailerModule } from '../mailer/mailer.module';
import { WebauthnController } from './controllers/webauthn.controller';
import { PushController } from './controllers/push.controller';
import { WebauthnService } from './services/webauthn.service';
import { PushService } from './services/push.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';
import { LoginEvent } from './entities/login-event.entity';
import { Role } from './entities/role.entity';
import { Membership } from './entities/membership.entity';
import { PermissionsGuard } from './guards/permissions.guard';
import { forwardRef } from '@nestjs/common';

@Global()
@Module({
  imports: [
    forwardRef(() => UsersModule),
    MailerModule,
    TypeOrmModule.forFeature([UserSession, LoginEvent, Role, Membership]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        privateKey: config.get<string>('jwt.accessPrivateKey')!,
        publicKey: config.get<string>('jwt.accessPublicKey')!,
        signOptions: {
          expiresIn: config.get<string>('jwt.accessExpiry')! as any,
          algorithm: 'RS256',
        },
      }),
    }),
  ],
  controllers: [
    AuthController,
    RolesController,
    WebauthnController,
    PushController,
  ],
  providers: [
    AuthService,
    RolesService,
    JwtStrategy,
    GoogleStrategy,
    MicrosoftStrategy,
    // GoogleSamlStrategy, // Disabled: passport-saml not installed
    // SamlStrategy,       // Disabled: passport-saml not installed
    JwtAuthGuard,
    PermissionsGuard,
    WebauthnService,
    PushService,
  ],
  exports: [AuthService, RolesService, PermissionsGuard, TypeOrmModule],
})
export class AuthModule {}
