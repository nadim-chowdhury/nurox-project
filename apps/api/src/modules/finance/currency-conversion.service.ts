import { Injectable } from '@nestjs/common';

@Injectable()
export class CurrencyConversionService {
  // Mock exchange rates - in a real app, this would fetch from an external API or DB
  private exchangeRates: Record<string, number> = {
    'USD': 1.0,
    'EUR': 0.92,
    'GBP': 0.79,
    'SAR': 3.75,
    'AED': 3.67,
    'INR': 83.0,
  };

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    
    const fromRate = this.exchangeRates[from];
    const toRate = this.exchangeRates[to];
    
    if (!fromRate || !toRate) {
      throw new Error(`Exchange rate not found for ${from} or ${to}`);
    }

    // Convert to base (USD), then to target
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }

  async convertToBase(amount: number, from: string): Promise<number> {
    return this.convert(amount, from, 'USD');
  }
}
