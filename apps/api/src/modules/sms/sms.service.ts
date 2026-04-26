import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly isDev: boolean;

  constructor(private readonly config: ConfigService) {
    this.isDev = this.config.get('app.nodeEnv') !== 'production';
  }

  /**
   * Sends an SMS message.
   * In development, it just logs to console.
   */
  async sendSms(to: string, message: string): Promise<boolean> {
    if (this.isDev) {
      this.logger.log(`[DEV SMS] To: ${to} | Message: ${message}`);
      return true;
    }

    // TODO: Implement actual Twilio logic here when credentials are ready
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({ body: message, from: sender, to });

    this.logger.warn(
      `SMS sending skipped in production: No provider configured.`,
    );
    return false;
  }

  /**
   * Sends a 6-digit OTP code.
   */
  async sendOtp(to: string, code: string): Promise<boolean> {
    const message = `Your Nurox verification code is: ${code}. Valid for 5 minutes.`;
    return this.sendSms(to, message);
  }
}
