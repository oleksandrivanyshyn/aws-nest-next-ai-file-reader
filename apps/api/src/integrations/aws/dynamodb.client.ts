import { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { awsConfig } from '../../config/aws.config';

export const DYNAMODB_CLIENT = Symbol('DYNAMODB_CLIENT');

export const dynamoDbClientProvider: Provider = {
  provide: DYNAMODB_CLIENT,
  inject: [awsConfig.KEY],
  useFactory: (
    config: ConfigType<typeof awsConfig>,
  ): DynamoDBDocumentClient => {
    const client = new DynamoDBClient({
      region: config.region,
    });
    return DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  },
};
