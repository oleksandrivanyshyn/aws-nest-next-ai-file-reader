import { Provider } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { geminiConfig } from '../../config/gemini.config';

export const GEMINI_CLIENT = Symbol('GEMINI_CLIENT');

export const geminiClientProvider: Provider = {
  provide: GEMINI_CLIENT,
  inject: [geminiConfig.KEY],
  useFactory: (config: ConfigType<typeof geminiConfig>): GoogleGenAI => {
    return new GoogleGenAI({ apiKey: config.apiKey || 'placeholder-key' });
  },
};
