import { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { awsConfig } from '../../config/aws.config';

export const S3_CLIENT = Symbol('S3_CLIENT');

export const s3ClientProvider: Provider = {
  provide: S3_CLIENT,
  inject: [awsConfig.KEY],
  useFactory: (config: ConfigType<typeof awsConfig>): S3Client => {
    return new S3Client({
      region: config.region,
    });
  },
};
