import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-saml';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { DataSource } from 'typeorm';
import { Tenant } from '../../system/entities/tenant.entity';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {
    super({
      // Base configuration
      // In a real multi-tenant app, these would be dynamically resolved
      // passport-saml allows passing a callback to constructor or using MultiSamlStrategy
      callbackUrl: `${configService.get<string>('API_URL')}/auth/saml/callback`,
      entryPoint: configService.get<string>('SAML_ENTRY_POINT')!,
      issuer: configService.get<string>('SAML_ISSUER')!,
      cert: configService.get<string>('SAML_CERT')!,

      // Map SAML attributes to profile fields
      identifierFormat: null,
      wantAssertionsSigned: true,
    });
  }

  async validate(profile: Profile) {
    if (!profile) {
      throw new UnauthorizedException();
    }

    // Map SAML profile to OAuthProfile format used by AuthService
    const oauthProfile = {
      email: profile.email || profile.nameID || (profile as any).mail,
      firstName: (profile as any).firstName || (profile as any).givenName || '',
      lastName: (profile as any).lastName || (profile as any).sn || '',
    };

    if (!oauthProfile.email) {
      throw new UnauthorizedException('Email not found in SAML profile');
    }

    return oauthProfile;
  }
}
