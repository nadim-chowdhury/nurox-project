import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('mail.host'),
      port: this.configService.get<number>('mail.port'),
      secure: this.configService.get<number>('mail.port') === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('mail.user'),
        pass: this.configService.get<string>('mail.password'),
      },
    });
  }

  async sendMail(options: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<any> {
    const from = this.configService.get<string>('mail.from');
    try {
      const info = (await this.transporter.sendMail({
        from,
        ...options,
      })) as { messageId: string };
      this.logger.log(`Message sent: ${info.messageId}`);
      return info;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error sending email to ${options.to}: ${message}`);
      // In development, we don't want to crash if SMTP is not configured
      if (this.configService.get('app.nodeEnv') === 'development') {
        this.logger.warn(
          'SMTP error in development — tokens are still logged below:',
        );
        this.logger.warn(`SUBJECT: ${options.subject}`);
        this.logger.warn(`BODY: ${options.text || options.html}`);
        return;
      }
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${this.configService.get('app.corsOrigin')}/reset-password?token=${token}`;
    await this.sendMail({
      to: email,
      subject: 'Reset your password — Nurox ERP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #00b96b;">Password Reset Request</h2>
          <p>You requested a password reset for your Nurox ERP account. Click the button below to set a new password. This link expires in 15 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #00b96b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });
  }

  async sendMagicLinkEmail(email: string, token: string) {
    const magicLink = `${this.configService.get('app.corsOrigin')}/auth/magic-link?token=${token}`;
    await this.sendMail({
      to: email,
      subject: 'Your Magic Link — Nurox ERP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #00b96b;">Login to Nurox ERP</h2>
          <p>Click the button below to log in to your account instantly. This link expires in 10 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background-color: #00b96b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Log In Now</a>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });
  }
}
