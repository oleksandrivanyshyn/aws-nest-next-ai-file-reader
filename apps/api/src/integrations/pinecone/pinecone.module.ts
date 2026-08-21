import { Module } from '@nestjs/common';
import { pineconeClientProvider } from './pinecone.client';
import { PineconeService } from './pinecone.service';

@Module({
  providers: [pineconeClientProvider, PineconeService],
  exports: [pineconeClientProvider, PineconeService],
})
export class PineconeModule {}
