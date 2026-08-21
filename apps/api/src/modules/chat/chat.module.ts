import { Module } from '@nestjs/common';
import { OpenAiModule } from '../../integrations/openai/openai.module';
import { PineconeModule } from '../../integrations/pinecone/pinecone.module';
import { DocumentsModule } from '../documents/documents.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [DocumentsModule, OpenAiModule, PineconeModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
