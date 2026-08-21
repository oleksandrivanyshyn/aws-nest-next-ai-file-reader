import { registerAs } from '@nestjs/config';

export const awsConfig = registerAs('aws', () => ({
  region: process.env.AWS_REGION,
  s3BucketName: process.env.S3_BUCKET_NAME,
  dynamoDbTableName: process.env.DYNAMODB_TABLE_NAME,
}));
