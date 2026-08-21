import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../../config/pinecone.config';
import { PINECONE_CLIENT } from './pinecone.client';

export interface PineconeMatch {
  text: string;
  score: number;
}

@Injectable()
export class PineconeService {
  constructor(
    @Inject(PINECONE_CLIENT) private readonly pineconeClient: Pinecone,
    @Inject(pineconeConfig.KEY)
    private readonly config: ConfigType<typeof pineconeConfig>,
  ) {}

  async deleteNamespace(namespace: string): Promise<void> {
    const index = this.pineconeClient.index(this.config.indexName ?? '');
    try {
      await index.namespace(namespace).deleteAll();
    } catch {
      return;
    }
  }

  async query(
    namespace: string,
    vector: number[],
    topK: number,
  ): Promise<PineconeMatch[]> {
    const index = this.pineconeClient.index(this.config.indexName ?? '');
    const result = await index.namespace(namespace).query({
      vector,
      topK,
      includeMetadata: true,
    });

    return (result.matches ?? []).map((match) => ({
      text: typeof match.metadata?.text === 'string' ? match.metadata.text : '',
      score: match.score ?? 0,
    }));
  }
}
