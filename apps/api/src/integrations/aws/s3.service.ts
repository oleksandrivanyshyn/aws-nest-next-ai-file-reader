import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { awsConfig } from '../../config/aws.config';
import { S3_CLIENT } from './s3.client';

@Injectable()
export class S3Service {
  constructor(
    @Inject(S3_CLIENT) private readonly s3Client: S3Client,
    @Inject(awsConfig.KEY)
    private readonly config: ConfigType<typeof awsConfig>,
  ) {}

  async createPresignedPutUrl(
    key: string,
    contentType: string,
    contentLength: number,
    expiresIn = 300,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.config.s3BucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn,
      signableHeaders: new Set(['content-type', 'content-length']),
    });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.config.s3BucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
