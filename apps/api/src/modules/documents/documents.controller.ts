import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateUploadUrlDto } from './dto/requests/create-upload-url.dto';
import { UserScopeDto } from './dto/requests/user-scope.dto';
import type { DocumentResponseDto } from './dto/responses/document.dto';
import type { UploadUrlResponseDto } from './dto/responses/upload-url.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload-url')
  async createUploadUrl(
    @Body() dto: CreateUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    return this.documentsService.createUploadUrl(dto);
  }

  @Get()
  async getDocument(
    @Query() query: UserScopeDto,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.findByEmail(query.email);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(@Query() query: UserScopeDto): Promise<void> {
    await this.documentsService.remove(query.email);
  }
}
