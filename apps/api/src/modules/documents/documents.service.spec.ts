import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from '../../integrations/aws/s3.service';
import { PineconeService } from '../../integrations/pinecone/pinecone.service';
import { DocumentsRepository } from './documents.repository';
import { DocumentsService } from './documents.service';
import type { CreateUploadUrlDto } from './dto/requests/create-upload-url.dto';
import { DOCUMENT_STATUS, DocumentRow } from './documents.types';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let mockDocumentsRepository: {
    findByEmail: jest.Mock;
    create: jest.Mock;
    deleteByEmail: jest.Mock;
  };
  let mockS3Service: {
    createPresignedPutUrl: jest.Mock;
    deleteObject: jest.Mock;
  };
  let mockPineconeService: {
    deleteNamespace: jest.Mock;
  };

  const sampleRow: DocumentRow = {
    userEmail: 'user@example.com',
    documentId: 'doc-123',
    fileName: 'resume.pdf',
    s3Key: 'uploads/doc-123.pdf',
    status: DOCUMENT_STATUS.PENDING,
    createdAt: '2026-08-21T10:00:00.000Z',
    updatedAt: '2026-08-21T10:00:00.000Z',
  };

  beforeEach(async () => {
    mockDocumentsRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      deleteByEmail: jest.fn(),
    };
    mockS3Service = {
      createPresignedPutUrl: jest.fn(),
      deleteObject: jest.fn(),
    };
    mockPineconeService = {
      deleteNamespace: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: DocumentsRepository,
          useValue: mockDocumentsRepository,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: PineconeService,
          useValue: mockPineconeService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  describe('createUploadUrl', () => {
    const uploadDto: CreateUploadUrlDto = {
      email: 'user@example.com',
      fileName: 'resume.pdf',
      fileType: 'application/pdf',
      fileSize: 1024 * 1024,
    };

    it('creates presigned URL and saves document record when no conflict', async () => {
      mockS3Service.createPresignedPutUrl.mockResolvedValue(
        'https://s3.amazonaws.com/test-bucket/uploads/presigned-url',
      );
      mockDocumentsRepository.create.mockResolvedValue(true);

      const result = await service.createUploadUrl(uploadDto);

      expect(mockS3Service.createPresignedPutUrl).toHaveBeenCalledWith(
        expect.stringMatching(/^uploads\/.+\.pdf$/),
        'application/pdf',
        1024 * 1024,
        'user@example.com',
        300,
      );
      expect(mockDocumentsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userEmail: 'user@example.com',
          fileName: 'resume.pdf',
          status: DOCUMENT_STATUS.PENDING,
        }),
      );
      expect(result.uploadUrl).toBe(
        'https://s3.amazonaws.com/test-bucket/uploads/presigned-url',
      );
      expect(typeof result.documentId).toBe('string');
      expect(result.documentId.length).toBeGreaterThan(0);
    });

    it('throws ConflictException naming the existing file when document already exists', async () => {
      mockS3Service.createPresignedPutUrl.mockResolvedValue(
        'https://s3.amazonaws.com/test-bucket/uploads/presigned-url',
      );
      mockDocumentsRepository.create.mockResolvedValue(false);
      mockDocumentsRepository.findByEmail.mockResolvedValue(sampleRow);

      await expect(service.createUploadUrl(uploadDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createUploadUrl(uploadDto)).rejects.toThrow(
        /resume\.pdf/,
      );
    });
  });

  describe('findByEmail', () => {
    it('returns mapped DocumentResponseDto when document exists', async () => {
      mockDocumentsRepository.findByEmail.mockResolvedValue(sampleRow);

      const result = await service.findByEmail('user@example.com');

      expect(result).toEqual({
        documentId: 'doc-123',
        fileName: 'resume.pdf',
        status: DOCUMENT_STATUS.PENDING,
        createdAt: '2026-08-21T10:00:00.000Z',
      });
      expect(result).not.toHaveProperty('s3Key');
      expect(result).not.toHaveProperty('userEmail');
    });

    it('throws NotFoundException when document is absent', async () => {
      mockDocumentsRepository.findByEmail.mockResolvedValue(null);

      await expect(service.findByEmail('missing@example.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes S3 object, Pinecone namespace, and database record in order', async () => {
      mockDocumentsRepository.findByEmail.mockResolvedValue(sampleRow);

      const callOrder: string[] = [];
      mockS3Service.deleteObject.mockImplementation(() => {
        callOrder.push('s3');
        return Promise.resolve();
      });
      mockPineconeService.deleteNamespace.mockImplementation(() => {
        callOrder.push('pinecone');
        return Promise.resolve();
      });
      mockDocumentsRepository.deleteByEmail.mockImplementation(() => {
        callOrder.push('repository');
        return Promise.resolve();
      });

      await service.remove('user@example.com');

      expect(callOrder).toEqual(['s3', 'pinecone', 'repository']);
      expect(mockS3Service.deleteObject).toHaveBeenCalledWith(
        'uploads/doc-123.pdf',
      );
      expect(mockPineconeService.deleteNamespace).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(mockDocumentsRepository.deleteByEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
    });

    it('throws NotFoundException when document does not exist and does not delete S3 or Pinecone', async () => {
      mockDocumentsRepository.findByEmail.mockResolvedValue(null);

      await expect(service.remove('missing@example.com')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockS3Service.deleteObject).not.toHaveBeenCalled();
      expect(mockPineconeService.deleteNamespace).not.toHaveBeenCalled();
      expect(mockDocumentsRepository.deleteByEmail).not.toHaveBeenCalled();
    });

    it('leaves record intact when S3 delete fails', async () => {
      mockDocumentsRepository.findByEmail.mockResolvedValue(sampleRow);
      mockS3Service.deleteObject.mockRejectedValue(new Error('S3 error'));

      await expect(service.remove('user@example.com')).rejects.toThrow(
        'S3 error',
      );
      expect(mockPineconeService.deleteNamespace).not.toHaveBeenCalled();
      expect(mockDocumentsRepository.deleteByEmail).not.toHaveBeenCalled();
    });
  });
});
