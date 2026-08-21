import { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { pineconeConfig } from '../../config/pinecone.config';

export const PINECONE_CLIENT = Symbol('PINECONE_CLIENT');

export const pineconeClientProvider: Provider = {
  provide: PINECONE_CLIENT,
  inject: [pineconeConfig.KEY],
  useFactory: (config: ConfigType<typeof pineconeConfig>): Pinecone => {
    return new Pinecone({
      apiKey: config.apiKey ?? '',
    });
  },
};
