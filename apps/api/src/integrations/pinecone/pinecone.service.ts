import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../../config/pinecone.config';
import { PINECONE_CLIENT } from './pinecone.client';

@Injectable()
export class PineconeService {
  constructor(
    @Inject(PINECONE_CLIENT) private readonly pineconeClient: Pinecone,
    @Inject(pineconeConfig.KEY)
    private readonly config: ConfigType<typeof pineconeConfig>,
  ) {}

  async deleteNamespace(namespace: string): Promise<void> {
    const index = this.pineconeClient.index(this.config.indexName ?? '');
    await index.namespace(namespace).deleteAll();
  }
}
