import { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import OpenAI from 'openai';
import { openaiConfig } from '../../config/openai.config';

export const OPENAI_CLIENT = Symbol('OPENAI_CLIENT');

export const openAiClientProvider: Provider = {
  provide: OPENAI_CLIENT,
  inject: [openaiConfig.KEY],
  useFactory: (config: ConfigType<typeof openaiConfig>): OpenAI => {
    return new OpenAI({
      apiKey: config.apiKey || 'placeholder-key',
    });
  },
};
