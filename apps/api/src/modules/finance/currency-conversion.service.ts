import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyRate } from './entities/currency-rate.entity';

@Injectable()
export class CurrencyConversionService {
  private readonly logger = new Logger(CurrencyConversionService.name);
  private readonly fixerApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CurrencyRate)
    private readonly rateRepo: Repository<CurrencyRate>,
  ) {
    this.fixerApiKey =
      this.configService.get<string>('finance.fixerApiKey') || '';
  }

  async getLatestRate(from: string, to: string): Promise<number> {
    if (from === to) return 1.0;

    const today = new Date().toISOString().split('T')[0];

    // 1. Check database for today's rate
    const existing = await this.rateRepo.findOne({
      where: { baseCurrency: from, targetCurrency: to, rateDate: today },
    });

    if (existing) {
      return Number(existing.rate);
    }

    // 2. Fetch from Fixer API if not found (or periodically)
    try {
      if (!this.fixerApiKey) {
        this.logger.warn(
          'Fixer API key not configured. Using fallback rate 1.0',
        );
        return 1.0;
      }

      const response = await fetch(
        `http://data.fixer.io/api/latest?access_key=${this.fixerApiKey}&base=${from}&symbols=${to}`,
      );
      const data = await response.json();

      if (data.success && data.rates[to]) {
        const rateValue = data.rates[to];

        // Cache the rate
        await this.rateRepo.save({
          baseCurrency: from,
          targetCurrency: to,
          rate: rateValue,
          rateDate: today,
        });

        return rateValue;
      } else {
        this.logger.error(`Fixer API error: ${JSON.stringify(data.error)}`);
        // Fallback to latest available rate in DB
        const lastRate = await this.rateRepo.findOne({
          where: { baseCurrency: from, targetCurrency: to },
          order: { rateDate: 'DESC' },
        });
        return lastRate ? Number(lastRate.rate) : 1.0;
      }
    } catch (error) {
      this.logger.error(`Failed to fetch exchange rate: ${error.message}`);
      return 1.0;
    }
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    const rate = await this.getLatestRate(from, to);
    return amount * rate;
  }

  async convertToBase(
    amount: number,
    from: string,
    baseCurrency = 'USD',
  ): Promise<number> {
    return this.convert(amount, from, baseCurrency);
  }
}
