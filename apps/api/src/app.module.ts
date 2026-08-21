import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { awsConfig } from './config/aws.config';
import { geminiConfig } from './config/gemini.config';
import { pineconeConfig } from './config/pinecone.config';
import { serverConfig } from './config/server.config';
import { ChatModule } from './modules/chat/chat.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [serverConfig, awsConfig, pineconeConfig, geminiConfig],
    }),
    DocumentsModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
