import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { awsConfig } from '../../config/aws.config';
import { DynamoDbService } from '../../integrations/aws/dynamodb.service';
import type { DocumentRow } from './documents.constants';

@Injectable()
export class DocumentsRepository {
  constructor(
    private readonly dynamoDbService: DynamoDbService,
    @Inject(awsConfig.KEY)
    private readonly config: ConfigType<typeof awsConfig>,
  ) {}

  async findByEmail(email: string): Promise<DocumentRow | null> {
    return this.dynamoDbService.get<DocumentRow>(
      this.config.dynamoDbTableName ?? '',
      { userEmail: email },
    );
  }

  async create(document: DocumentRow): Promise<boolean> {
    return this.dynamoDbService.putIfAbsent(
      this.config.dynamoDbTableName ?? '',
      document,
      'userEmail',
    );
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.dynamoDbService.delete(this.config.dynamoDbTableName ?? '', {
      userEmail: email,
    });
  }
}
