import { ValueTransformer } from 'typeorm';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// Retrieve a consistent 32-byte key from environment or use a default for local dev
const ENCRYPTION_KEY = Buffer.from(
  (process.env.DB_ENCRYPTION_KEY || 'default-encryption-key-must-be-32')
    .padEnd(32, '0')
    .slice(0, 32),
  'utf-8',
);

export class EncryptionTransformer implements ValueTransformer {
  to(value: string | null | undefined): string | null {
    if (!value) return null;

    const iv = crypto.randomBytes(12); // GCM standard IV size
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

    const encrypted = Buffer.concat([
      cipher.update(value, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  }

  from(value: string | null | undefined): string | null {
    if (!value) return null;

    try {
      const parts = value.split(':');
      if (parts.length !== 3) return value; // In case it's an unencrypted legacy value

      const [ivHex, authTagHex, encryptedHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');

      const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch (err) {
      console.error('Decryption failed:', err.message);
      return null;
    }
  }
}
