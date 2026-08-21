import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import OpenAI from 'openai';
import { openaiConfig } from '../../config/openai.config';
import { OPENAI_CLIENT } from './openai.client';

@Injectable()
export class OpenAiService {
  constructor(
    @Inject(OPENAI_CLIENT) private readonly openAiClient: OpenAI,
    @Inject(openaiConfig.KEY)
    private readonly config: ConfigType<typeof openaiConfig>,
  ) {}

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openAiClient.embeddings.create({
      model: this.config.embeddingModel,
      input: text,
    });

    return response.data[0]?.embedding ?? [];
  }

  async createCompletion(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const response = await this.openAiClient.chat.completions.create({
      model: this.config.chatModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return response.choices[0]?.message?.content ?? '';
  }
}
