import { Module } from '@nestjs/common';
import { AwsModule } from '../../integrations/aws/aws.module';
import { PineconeModule } from '../../integrations/pinecone/pinecone.module';
import { DocumentsController } from './documents.controller';
import { DocumentsRepository } from './documents.repository';
import { DocumentsService } from './documents.service';

@Module({
  imports: [AwsModule, PineconeModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository],
  exports: [DocumentsService],
})
export class DocumentsModule {}
