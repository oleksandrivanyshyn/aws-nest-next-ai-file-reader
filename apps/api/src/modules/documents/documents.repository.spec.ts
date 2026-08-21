import { Test, TestingModule } from '@nestjs/testing';
import { awsConfig } from '../../config/aws.config';
import { DynamoDbService } from '../../integrations/aws/dynamodb.service';
import { DocumentsRepository } from './documents.repository';
import { DOCUMENT_STATUS, type DocumentRow } from './documents.constants';

describe('DocumentsRepository', () => {
  let repository: DocumentsRepository;
  let mockDynamoDbService: {
    get: jest.Mock;
    putIfAbsent: jest.Mock;
    delete: jest.Mock;
  };

  const mockConfig = {
    dynamoDbTableName: 'test-table',
  };

  const sampleRow: DocumentRow = {
    userEmail: 'test@example.com',
    documentId: 'doc-123',
    fileName: 'test.pdf',
    s3Key: 'uploads/doc-123.pdf',
    status: DOCUMENT_STATUS.PENDING,
    createdAt: '2026-08-21T00:00:00.000Z',
    updatedAt: '2026-08-21T00:00:00.000Z',
  };

  beforeEach(async () => {
    mockDynamoDbService = {
      get: jest.fn(),
      putIfAbsent: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsRepository,
        {
          provide: DynamoDbService,
          useValue: mockDynamoDbService,
        },
        {
          provide: awsConfig.KEY,
          useValue: mockConfig,
        },
      ],
    }).compile();

    repository = module.get<DocumentsRepository>(DocumentsRepository);
  });

  describe('findByEmail', () => {
    it('returns the document row when found', async () => {
      mockDynamoDbService.get.mockResolvedValue(sampleRow);

      const result = await repository.findByEmail('test@example.com');

      expect(mockDynamoDbService.get).toHaveBeenCalledWith('test-table', {
        userEmail: 'test@example.com',
      });
      expect(result).toEqual(sampleRow);
    });

    it('returns null when document is not found', async () => {
      mockDynamoDbService.get.mockResolvedValue(null);

      const result = await repository.findByEmail('test@example.com');

      expect(mockDynamoDbService.get).toHaveBeenCalledWith('test-table', {
        userEmail: 'test@example.com',
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('returns true when write succeeds', async () => {
      mockDynamoDbService.putIfAbsent.mockResolvedValue(true);

      const result = await repository.create(sampleRow);

      expect(mockDynamoDbService.putIfAbsent).toHaveBeenCalledWith(
        'test-table',
        sampleRow,
        'userEmail',
      );
      expect(result).toBe(true);
    });

    it('returns false when conditional write fails', async () => {
      mockDynamoDbService.putIfAbsent.mockResolvedValue(false);

      const result = await repository.create(sampleRow);

      expect(mockDynamoDbService.putIfAbsent).toHaveBeenCalledWith(
        'test-table',
        sampleRow,
        'userEmail',
      );
      expect(result).toBe(false);
    });
  });

  describe('deleteByEmail', () => {
    it('deletes the document by email', async () => {
      mockDynamoDbService.delete.mockResolvedValue(undefined);

      await repository.deleteByEmail('test@example.com');

      expect(mockDynamoDbService.delete).toHaveBeenCalledWith('test-table', {
        userEmail: 'test@example.com',
      });
    });
  });
});
