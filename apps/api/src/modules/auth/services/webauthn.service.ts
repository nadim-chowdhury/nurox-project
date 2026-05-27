import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class WebauthnService {
  private readonly logger = new Logger(WebauthnService.name);
  private rpName = 'Nurox ERP';
  private rpID = 'localhost'; // Should be dynamic in production (e.g. app.nurox.io)
  private origin = 'http://localhost:3000'; // Should be dynamic

  // In a real app, this would be stored in Redis or DB per-user during the ceremony
  private currentChallenges: Record<string, string> = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async generateRegistrationOptions(user: User) {
    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpID,
      userID: Buffer.from(user.id),
      userName: user.email,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });
    this.currentChallenges[user.id] = options.challenge;
    return options;
  }

  async verifyRegistration(user: User, body: any) {
    const expectedChallenge = this.currentChallenges[user.id];
    if (!expectedChallenge)
      throw new HttpException('Challenge not found', HttpStatus.BAD_REQUEST);

    try {
      const verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge,
        expectedOrigin: this.origin,
        expectedRPID: this.rpID,
      });

      if (verification.verified && verification.registrationInfo) {
        // Save the credential to the user in DB (mocked for now)
        this.logger.log(
          `User ${user.id} registered WebAuthn credential successfully`,
        );
        return { verified: true };
      }
      return { verified: false };
    } catch (error) {
      this.logger.error('WebAuthn verification failed', error);
      throw new HttpException('Verification failed', HttpStatus.BAD_REQUEST);
    }
  }

  async generateAuthenticationOptions(user: User) {
    // In reality, pass the stored credential IDs here
    const options = await generateAuthenticationOptions({
      rpID: this.rpID,
      userVerification: 'preferred',
    });
    this.currentChallenges[user.id] = options.challenge;
    return options;
  }

  async verifyAuthentication(user: User, body: any) {
    const expectedChallenge = this.currentChallenges[user.id];
    if (!expectedChallenge)
      throw new HttpException('Challenge not found', HttpStatus.BAD_REQUEST);

    // In reality, pull the user's saved credential from DB
    // Mocking success
    this.logger.log(`User ${user.id} authenticated via WebAuthn successfully`);
    return { verified: true };
  }
}
