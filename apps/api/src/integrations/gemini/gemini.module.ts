import { Module } from '@nestjs/common';
import { geminiClientProvider } from './gemini.client';
import { GeminiService } from './gemini.service';

@Module({
  providers: [geminiClientProvider, GeminiService],
  exports: [GeminiService],
})
export class GeminiModule {}
