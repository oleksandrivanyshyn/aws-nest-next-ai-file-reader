import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { awsConfig } from './config/aws.config';
import { pineconeConfig } from './config/pinecone.config';
import { serverConfig } from './config/server.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [serverConfig, awsConfig, pineconeConfig] }),
  ],
  controllers: [AppController],
})
export class AppModule {}
