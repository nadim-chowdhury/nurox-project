import { registerAs } from '@nestjs/config';

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

export const jwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET,
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  magicLinkSecret:
    process.env.JWT_MAGIC_LINK_SECRET || process.env.JWT_REFRESH_SECRET,
  magicLinkExpiry: process.env.JWT_MAGIC_LINK_EXPIRY || '10m',
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
}));

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
