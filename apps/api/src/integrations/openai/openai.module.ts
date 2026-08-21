import { Module } from '@nestjs/common';
import { openAiClientProvider } from './openai.client';
import { OpenAiService } from './openai.service';

@Module({
  providers: [openAiClientProvider, OpenAiService],
  exports: [OpenAiService],
})
export class OpenAiModule {}
