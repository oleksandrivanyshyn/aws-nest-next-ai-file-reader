import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AskQuestionDto } from './dto/requests/ask-question.dto';
import type { AnswerResponseDto } from './dto/responses/answer.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async askQuestion(@Body() dto: AskQuestionDto): Promise<AnswerResponseDto> {
    return this.chatService.askQuestion(dto);
  }
}
