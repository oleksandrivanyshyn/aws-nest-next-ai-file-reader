import { Module } from '@nestjs/common';
import { dynamoDbClientProvider } from './dynamodb.client';
import { DynamoDbService } from './dynamodb.service';
import { s3ClientProvider } from './s3.client';
import { S3Service } from './s3.service';

@Module({
  providers: [
    s3ClientProvider,
    S3Service,
    dynamoDbClientProvider,
    DynamoDbService,
  ],
  exports: [
    s3ClientProvider,
    S3Service,
    dynamoDbClientProvider,
    DynamoDbService,
  ],
})
export class AwsModule {}
