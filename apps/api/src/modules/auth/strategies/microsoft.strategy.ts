import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

interface MicrosoftProfile {
  displayName: string;
  emails: { value: string }[];
  name: {
    givenName: string;
    familyName: string;
  };
  userPrincipalName?: string;
}

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  private readonly logger = new Logger(MicrosoftStrategy.name);

  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('oauth.microsoft.clientId');
    const clientSecret = configService.get<string>('oauth.microsoft.clientSecret');

    super({
      clientID: clientID || 'MISSING_MICROSOFT_CLIENT_ID',
      clientSecret: clientSecret || 'MISSING_MICROSOFT_CLIENT_SECRET',
      callbackURL: configService.get<string>('oauth.microsoft.callbackUrl')!,
      scope: ['user.read'],
      tenant: 'common',
    });

    if (!clientID || !clientSecret) {
      this.logger.warn(
        'Microsoft OAuth credentials are missing. Microsoft login will not work.',
      );
    }
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: MicrosoftProfile,
    done: (err: any, user: any) => void,
  ): any {
    const { displayName, emails, name } = profile;
    const user = {
      email: emails?.[0]?.value || profile.userPrincipalName || '',
      firstName: name?.givenName || displayName.split(' ')[0],
      lastName: name?.familyName || displayName.split(' ').slice(1).join(' '),
      accessToken,
    };
    done(null, user);
  }
}
