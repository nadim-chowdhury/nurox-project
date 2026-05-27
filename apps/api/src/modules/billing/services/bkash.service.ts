import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BkashService {
  private readonly logger = new Logger(BkashService.name);
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get('app.nodeEnv') === 'production'
        ? 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized/checkout'
        : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout';
  }

  async grantToken() {
    this.logger.log('Granting bKash Token');
    // Implement token grant using credentials from config
    return { id_token: 'mock_bkash_token' };
  }

  async createPayment(amount: number, invoiceId: string) {
    this.logger.log(`Creating bKash Payment for invoice ${invoiceId}`);
    // Use token to create payment and get payment ID / bkashURL
    return {
      paymentID: 'mock_bkash_payment_id',
      bkashURL: 'https://sandbox.bka.sh/checkout?paymentID=mock',
    };
  }

  async executePayment(paymentID: string) {
    this.logger.log(`Executing bKash Payment ${paymentID}`);
    // Execute payment and verify success
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID,
      trxID: 'MOCK_TRX_12345',
    };
  }
}
