import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  VerifyCallback,
  Profile,
  StrategyOptions,
} from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(private configService: ConfigService) {
    const clientID = configService.get<string>('oauth.google.clientId');
    const clientSecret = configService.get<string>('oauth.google.clientSecret');

    if (!clientID || !clientSecret) {
      // Use dummy values if missing to allow startup.
      // Login will fail at runtime if triggered, which is fine.
    }

    const options: StrategyOptions = {
      clientID: clientID || 'MISSING_GOOGLE_CLIENT_ID',
      clientSecret: clientSecret || 'MISSING_GOOGLE_CLIENT_SECRET',
      callbackURL: configService.get<string>('oauth.google.callbackUrl')!,
      scope: ['email', 'profile'],
    };

    super(options);

    if (!clientID || !clientSecret) {
      this.logger.warn(
        'Google OAuth credentials are missing. Google login will not work.',
      );
    }
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): any {
    const { name, emails, photos } = profile;
    const user = {
      email: emails?.[0]?.value || '',
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos?.[0]?.value || '',
      accessToken,
    };
    done(null, user);
  }
}
