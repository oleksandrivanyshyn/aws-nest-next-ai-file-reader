import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpenAiService } from '../../integrations/openai/openai.service';
import { PineconeService } from '../../integrations/pinecone/pinecone.service';
import { DocumentsService } from '../documents/documents.service';
import type { DocumentResponseDto } from '../documents/dto/responses/document.dto';
import {
  CHAT_SYSTEM_PROMPT_NO_CONTEXT,
  CHAT_SYSTEM_PROMPT_WITH_CONTEXT,
  MIN_RELEVANCE_SCORE,
  TOP_K,
} from './chat.constants';
import type { AskQuestionDto } from './dto/requests/ask-question.dto';
import type { AnswerResponseDto } from './dto/responses/answer.dto';
import { DOCUMENT_STATUS } from '../documents/documents.types';

@Injectable()
export class ChatService {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly openAiService: OpenAiService,
    private readonly pineconeService: PineconeService,
  ) {}

  async askQuestion(dto: AskQuestionDto): Promise<AnswerResponseDto> {
    let document: DocumentResponseDto;
    try {
      document = await this.documentsService.findByEmail(dto.email);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw new ConflictException('No document uploaded for this user');
      }
      throw error;
    }

    if (document.status !== DOCUMENT_STATUS.SUCCESS) {
      throw new ConflictException(
        `Document is not ready for chat (status: ${document.status})`,
      );
    }

    const embedding = await this.openAiService.createEmbedding(dto.question);
    const matches = await this.pineconeService.query(
      dto.email,
      embedding,
      TOP_K,
    );

    const relevantChunks = matches
      .filter(
        (match) =>
          match.score >= MIN_RELEVANCE_SCORE && match.text.trim().length > 0,
      )
      .map((match) => match.text);

    let systemPrompt: string;
    let userPrompt: string;

    if (relevantChunks.length > 0) {
      systemPrompt = CHAT_SYSTEM_PROMPT_WITH_CONTEXT;
      const context = relevantChunks.join('\n\n---\n\n');
      userPrompt = `Document Excerpts:\n${context}\n\nQuestion: ${dto.question}`;
    } else {
      systemPrompt = CHAT_SYSTEM_PROMPT_NO_CONTEXT;
      userPrompt = `Question: ${dto.question}`;
    }

    const answer = await this.openAiService.createCompletion(
      systemPrompt,
      userPrompt,
    );

    return { answer };
  }
}
