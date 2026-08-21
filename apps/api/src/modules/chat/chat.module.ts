import { Module } from '@nestjs/common';
import { GeminiModule } from '../../integrations/gemini/gemini.module';
import { PineconeModule } from '../../integrations/pinecone/pinecone.module';
import { DocumentsModule } from '../documents/documents.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [DocumentsModule, GeminiModule, PineconeModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
