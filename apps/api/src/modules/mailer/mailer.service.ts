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
    attachments?: any[];
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

  async sendInviteEmail(email: string, token: string, firstName: string) {
    const inviteUrl = `${this.configService.get('app.corsOrigin')}/register?token=${token}`;
    await this.sendMail({
      to: email,
      subject: 'You have been invited to join Nurox ERP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #00b96b;">Welcome to Nurox ERP, ${firstName}!</h2>
          <p>You have been invited to join your organization's ERP system. Click the button below to complete your registration and set your password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #00b96b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Join Now</a>
          </div>
          <p>This invitation link will expire in 48 hours.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${this.configService.get('app.corsOrigin')}/verify-email?token=${token}`;
    await this.sendMail({
      to: email,
      subject: 'Verify your email — Nurox ERP',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #00b96b;">Email Verification</h2>
          <p>Thank you for signing up for Nurox ERP. Please verify your email address by clicking the button below.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #00b96b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });
  }

  async sendTrialReminderEmail(email: string, daysLeft: number) {
    const portalUrl = `${this.configService.get('app.corsOrigin')}/dashboard/settings/billing`;
    await this.sendMail({
      to: email,
      subject: `Your Nurox ERP trial expires in ${daysLeft} days`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #00b96b;">Trial Expiring Soon</h2>
          <p>Your free trial of Nurox ERP will expire in exactly <strong>${daysLeft} days</strong>.</p>
          <p>To ensure uninterrupted access to your data and tools, please upgrade your subscription plan today.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" style="background-color: #00b96b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Upgrade Plan</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });
  }

  async sendDunningEmail(email: string, amount: number, attempt: number) {
    const portalUrl = `${this.configService.get('app.corsOrigin')}/dashboard/settings/billing`;
    const attemptMsg =
      attempt >= 3
        ? 'Final Notice: Your account will be suspended shortly if payment is not received.'
        : 'We were unable to process your recent payment.';

    await this.sendMail({
      to: email,
      subject: `Action Required: Payment Failed (Attempt ${attempt}/3)`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #ffb4ab;">Payment Failed</h2>
          <p>${attemptMsg}</p>
          <p>The outstanding amount is <strong>$${amount.toFixed(2)}</strong>.</p>
          <p>Please update your payment method to keep your account active.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${portalUrl}" style="background-color: #1a2235; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; border: 1px solid #3d4a63;">Update Payment Method</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply.</p>
        </div>
      `,
    });
  }
}
