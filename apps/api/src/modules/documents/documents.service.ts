import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from '../../integrations/aws/s3.service';
import { PineconeService } from '../../integrations/pinecone/pinecone.service';
import {
  DOCUMENT_STATUS,
  PRESIGNED_URL_TTL_SECONDS,
  type DocumentRow,
} from './documents.constants';
import { DocumentsRepository } from './documents.repository';
import type { CreateUploadUrlDto } from './dto/requests/create-upload-url.dto';
import {
  DocumentResponseDto,
  toDocumentDto,
} from './dto/responses/document.dto';
import type { UploadUrlResponseDto } from './dto/responses/upload-url.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly s3Service: S3Service,
    private readonly pineconeService: PineconeService,
  ) {}

  async createUploadUrl(
    dto: CreateUploadUrlDto,
  ): Promise<UploadUrlResponseDto> {
    const documentId = uuidv4();
    const s3Key = `uploads/${documentId}.pdf`;

    const uploadUrl = await this.s3Service.createPresignedPutUrl(
      s3Key,
      dto.fileType,
      dto.fileSize,
      dto.email,
      PRESIGNED_URL_TTL_SECONDS,
    );

    const now = new Date().toISOString();
    const record: DocumentRow = {
      userEmail: dto.email,
      documentId,
      fileName: dto.fileName,
      s3Key,
      status: DOCUMENT_STATUS.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    const created = await this.documentsRepository.create(record);
    if (!created) {
      const existing = await this.documentsRepository.findByEmail(dto.email);
      const existingFileName = existing?.fileName ?? 'existing document';
      throw new ConflictException(
        `User already has an uploaded document: ${existingFileName}`,
      );
    }

    return {
      uploadUrl,
      documentId,
    };
  }

  async findByEmail(email: string): Promise<DocumentResponseDto> {
    const document = await this.documentsRepository.findByEmail(email);
    if (!document) {
      throw new NotFoundException(`No document found for email: ${email}`);
    }

    return toDocumentDto(document);
  }

  async remove(email: string): Promise<void> {
    const document = await this.documentsRepository.findByEmail(email);
    if (!document) {
      throw new NotFoundException(`No document found for email: ${email}`);
    }

    await this.s3Service.deleteObject(document.s3Key);
    await this.pineconeService.deleteNamespace(email);
    await this.documentsRepository.deleteByEmail(email);
  }
}
