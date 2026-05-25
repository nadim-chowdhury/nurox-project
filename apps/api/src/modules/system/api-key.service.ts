import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) {}

  async generateKey(
    name: string,
    tenantId: string,
    scopes: string[] = [],
  ): Promise<{ rawKey: string; apiKeyEntity: ApiKey }> {
    // Generate a secure random string
    const rawKey = crypto.randomBytes(32).toString('hex');
    const keyPrefix = rawKey.substring(0, 8);

    // Hash the key using bcrypt for storage
    const saltRounds = 10;
    const keyHash = await bcrypt.hash(rawKey, saltRounds);

    const apiKey = this.apiKeyRepo.create({
      tenantId,
      name,
      keyPrefix,
      keyHash,
      scopes,
      isActive: true,
    });

    const apiKeyEntity = await this.apiKeyRepo.save(apiKey);

    return { rawKey, apiKeyEntity };
  }

  async validateKey(rawKey: string): Promise<ApiKey | null> {
    if (!rawKey || rawKey.length < 8) return null;

    const keyPrefix = rawKey.substring(0, 8);

    // Find active keys matching the prefix
    const keys = await this.apiKeyRepo.find({
      where: { keyPrefix, isActive: true },
    });

    if (!keys || keys.length === 0) {
      return null;
    }

    // Since prefixes could theoretically collide, we check all matching active keys
    for (const key of keys) {
      const isValid = await bcrypt.compare(rawKey, key.keyHash);
      if (isValid) {
        // Optionally update lastUsedAt here, or fire an event to do it asynchronously
        return key;
      }
    }

    return null;
  }
}
