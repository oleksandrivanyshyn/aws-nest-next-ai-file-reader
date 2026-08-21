import { Inject, Injectable } from '@nestjs/common';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { DYNAMODB_CLIENT } from './dynamodb.client';

@Injectable()
export class DynamoDbService {
  constructor(
    @Inject(DYNAMODB_CLIENT)
    private readonly dynamoDbClient: DynamoDBDocumentClient,
  ) {}

  async get<T>(
    tableName: string,
    key: Record<string, unknown>,
  ): Promise<T | null> {
    const result = await this.dynamoDbClient.send(
      new GetCommand({
        TableName: tableName,
        Key: key,
      }),
    );

    return (result.Item as T) ?? null;
  }

  async putIfAbsent<T extends Record<string, unknown>>(
    tableName: string,
    item: T,
    conditionAttribute: string,
  ): Promise<boolean> {
    try {
      await this.dynamoDbClient.send(
        new PutCommand({
          TableName: tableName,
          Item: item,
          ConditionExpression: `attribute_not_exists(${conditionAttribute})`,
        }),
      );
      return true;
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.name === 'ConditionalCheckFailedException'
      ) {
        return false;
      }
      throw error;
    }
  }

  async delete(tableName: string, key: Record<string, unknown>): Promise<void> {
    await this.dynamoDbClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: key,
      }),
    );
  }
}
