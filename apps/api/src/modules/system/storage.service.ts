import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('s3.bucket')!;

    this.client = new S3Client({
      endpoint: this.configService.get<string>('s3.endpoint'),
      region: this.configService.get<string>('s3.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('s3.accessKeyId')!,
        secretAccessKey: this.configService.get<string>('s3.secretAccessKey')!,
      },
      forcePathStyle: true, // Required for MinIO
    });
  }

  /**
   * Generates a pre-signed URL for uploading a file directly to S3/MinIO.
   */
  async getUploadPresignedUrl(
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 }); // 1 hour
  }

  /**
   * Generates a pre-signed URL for viewing a private file.
   */
  async getViewPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  /**
   * Alias for getViewPresignedUrl for downloading.
   */
  async getDownloadPresignedUrl(key: string): Promise<string> {
    return this.getViewPresignedUrl(key);
  }

  /**
   * Returns the public URL for a file (if the bucket is public).
   */
  getPublicUrl(key: string): string {
    const publicBase = this.configService.get<string>('s3.publicUrl');
    return `${publicBase}/${key}`;
  }

  /**
   * Directly uploads a buffer to S3/MinIO.
   */
  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.client.send(command);
    return this.getPublicUrl(key);
  }
}
