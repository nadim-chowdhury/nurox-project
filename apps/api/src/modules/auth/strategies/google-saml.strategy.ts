import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from '@node-saml/passport-saml';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleSamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super(
      {
        callbackUrl: configService.get<string>(
          'auth.saml.callbackUrl',
          'http://localhost:3001/api/v1/auth/saml/callback',
        ),
        entryPoint: configService.get<string>(
          'auth.saml.entryPoint',
          'https://accounts.google.com/o/saml2/idp?idpid=YOUR_IDP_ID',
        ),
        issuer: configService.get<string>('auth.saml.issuer', 'nurox-erp'),
        cert: configService.get<string>(
          'auth.saml.cert',
          'YOUR_GOOGLE_WORKSPACE_X509_CERT',
        ),
      } as any,
      (profile: any, done: any) => {
        // NestJS PassportStrategy wraps this and normally handles the callback itself,
        // but @node-saml/passport-saml enforces a second argument in TS.
        this.validate(profile)
          .then((user) => done(null, user))
          .catch((err) => done(err, false));
      },
    );
  }

  async validate(profile: Profile): Promise<any> {
    if (!profile || !profile.email) {
      throw new UnauthorizedException('Invalid SAML profile returned');
    }

    const email = profile.email as string;

    // Find or provision user based on SAML assertion
    // Note: In multi-tenant, we must determine tenant from email domain or request context
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Auto-provision or reject
      throw new UnauthorizedException('User not provisioned in ERP');
    }

    return user;
  }
}
