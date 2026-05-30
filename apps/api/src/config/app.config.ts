import { registerAs } from '@nestjs/config';
import * as crypto from 'crypto';

/** Docker .env files often store PEM keys with literal `\\n` — normalize for jsonwebtoken. */
function normalizePem(value: string | undefined): string | undefined {
  if (!value) return value;
  return value.replace(/\\n/g, '\n').trim();
}

export const databaseConfig = registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL || 'false',
}));

export const jwtConfig = registerAs('jwt', () => {
  let privateKey = normalizePem(process.env.JWT_ACCESS_PRIVATE_KEY);
  let publicKey = normalizePem(process.env.JWT_ACCESS_PUBLIC_KEY);

  if (!privateKey || !publicKey) {
    if (process.env.NODE_ENV !== 'production') {
      // Auto-generate keys for local dev
      const { publicKey: pub, privateKey: priv } = crypto.generateKeyPairSync(
        'rsa',
        {
          modulusLength: 2048,
          publicKeyEncoding: { type: 'spki', format: 'pem' },
          privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        },
      );
      privateKey = priv;
      publicKey = pub;
    } else {
      throw new Error(
        'JWT_ACCESS_PRIVATE_KEY and JWT_ACCESS_PUBLIC_KEY must be provided in production',
      );
    }
  }

  // Refresh token secret — HMAC-based (separate from RS256 access tokens)
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_REFRESH_SECRET must be provided in production');
  }

  // Magic link secret — short-lived tokens for passwordless auth
  const magicLinkSecret = process.env.JWT_MAGIC_LINK_SECRET;
  if (!magicLinkSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_MAGIC_LINK_SECRET must be provided in production');
  }

  return {
    accessPrivateKey: privateKey,
    accessPublicKey: publicKey,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshSecret: refreshSecret || crypto.randomBytes(64).toString('hex'),
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    magicLinkSecret: magicLinkSecret || crypto.randomBytes(32).toString('hex'),
    magicLinkExpiry: process.env.JWT_MAGIC_LINK_EXPIRY || '10m',
  };
});

export const redisConfig = registerAs('redis', () => {
  let host = process.env.REDIS_HOST || 'localhost';
  // Remove protocol prefix if present
  host = host
    .replace(/^https?:\/\//, '')
    .split(':')[0]
    .split('/')[0];
  return {
    host,
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  };
});

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  corsOrigin: process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000',
}));

export const mailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '587', 10),
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM || '"Nurox ERP" <noreply@nurox.app>',
}));

export const oauthConfig = registerAs('oauth', () => ({
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:3001/api/auth/google/callback',
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackUrl:
      process.env.MICROSOFT_CALLBACK_URL ||
      'http://localhost:3001/api/auth/microsoft/callback',
  },
}));

export const s3Config = registerAs('s3', () => ({
  endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
  region: process.env.S3_REGION || 'us-east-1',
  accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minioadmin',
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || 'minioadmin',
  bucket: process.env.S3_BUCKET || 'nurox-erp',
  publicUrl: process.env.S3_PUBLIC_URL || 'http://localhost:9000/nurox-erp',
}));

export const hrConfig = registerAs('hr', () => ({
  probationDuration: {
    FULL_TIME: 90, // days
    PART_TIME: 90,
    CONTRACT: 30,
    INTERN: 30,
    PROBATION: 180,
  },
}));

export const aiConfig = registerAs('ai', () => ({
  openaiApiKey: process.env.OPENAI_API_KEY,
}));

export const financeConfig = registerAs('finance', () => ({
  fixerApiKey: process.env.FIXER_API_KEY,
}));
