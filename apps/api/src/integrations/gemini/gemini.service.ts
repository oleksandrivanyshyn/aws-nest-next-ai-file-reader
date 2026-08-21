import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { geminiConfig } from '../../config/gemini.config';
import { GEMINI_CLIENT } from './gemini.client';

@Injectable()
export class GeminiService {
  constructor(
    @Inject(GEMINI_CLIENT) private readonly geminiClient: GoogleGenAI,
    @Inject(geminiConfig.KEY)
    private readonly config: ConfigType<typeof geminiConfig>,
  ) {}

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.geminiClient.models.embedContent({
      model: this.config.embeddingModel,
      contents: text,
      config: { outputDimensionality: this.config.embeddingDimensions },
    });

    return response.embeddings?.[0]?.values ?? [];
  }

  async createCompletion(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<string> {
    const response = await this.geminiClient.models.generateContent({
      model: this.config.chatModel,
      contents: userPrompt,
      config: { systemInstruction: systemPrompt },
    });

    return response.text ?? '';
  }
}
