import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from '../../integrations/gemini/gemini.service';
import { PineconeService } from '../../integrations/pinecone/pinecone.service';
import { DocumentsService } from '../documents/documents.service';
import {
  CHAT_SYSTEM_PROMPT_NO_CONTEXT,
  CHAT_SYSTEM_PROMPT_WITH_CONTEXT,
  TOP_K,
} from './chat.constants';
import { ChatService } from './chat.service';
import { DOCUMENT_STATUS } from '../documents/documents.constants';

describe('ChatService', () => {
  let service: ChatService;
  let mockDocumentsService: {
    findByEmail: jest.Mock;
  };
  let mockGeminiService: {
    createEmbedding: jest.Mock;
    createCompletion: jest.Mock;
  };
  let mockPineconeService: {
    query: jest.Mock;
  };

  const successDocument = {
    documentId: 'doc-123',
    fileName: 'manual.pdf',
    status: DOCUMENT_STATUS.SUCCESS,
    createdAt: '2026-08-21T10:00:00.000Z',
  };

  beforeEach(async () => {
    mockDocumentsService = {
      findByEmail: jest.fn(),
    };
    mockGeminiService = {
      createEmbedding: jest.fn(),
      createCompletion: jest.fn(),
    };
    mockPineconeService = {
      query: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
        {
          provide: GeminiService,
          useValue: mockGeminiService,
        },
        {
          provide: PineconeService,
          useValue: mockPineconeService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('askQuestion', () => {
    const questionDto = {
      email: 'user@example.com',
      question: 'What are the main features?',
    };

    it('throws ConflictException when user has no uploaded document and makes no AI calls', async () => {
      mockDocumentsService.findByEmail.mockRejectedValue(
        new NotFoundException('No document found'),
      );

      await expect(service.askQuestion(questionDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockGeminiService.createEmbedding).not.toHaveBeenCalled();
      expect(mockPineconeService.query).not.toHaveBeenCalled();
      expect(mockGeminiService.createCompletion).not.toHaveBeenCalled();
    });

    it('throws ConflictException when document status is PENDING', async () => {
      mockDocumentsService.findByEmail.mockResolvedValue({
        ...successDocument,
        status: DOCUMENT_STATUS.PENDING,
      });

      await expect(service.askQuestion(questionDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockGeminiService.createEmbedding).not.toHaveBeenCalled();
    });

    it('throws ConflictException when document status is ERROR', async () => {
      mockDocumentsService.findByEmail.mockResolvedValue({
        ...successDocument,
        status: DOCUMENT_STATUS.ERROR,
      });

      await expect(service.askQuestion(questionDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockGeminiService.createEmbedding).not.toHaveBeenCalled();
    });

    it('retrieves relevant chunks, formats context prompt, and returns answer', async () => {
      mockDocumentsService.findByEmail.mockResolvedValue(successDocument);
      mockGeminiService.createEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockPineconeService.query.mockResolvedValue([
        { text: 'Relevant chunk 1', score: 0.85 },
        { text: 'Low score chunk', score: 0.15 },
        { text: 'Relevant chunk 2', score: 0.72 },
      ]);
      mockGeminiService.createCompletion.mockResolvedValue(
        'Here is the answer from the document.',
      );

      const result = await service.askQuestion(questionDto);

      expect(mockGeminiService.createEmbedding).toHaveBeenCalledWith(
        'What are the main features?',
      );
      expect(mockPineconeService.query).toHaveBeenCalledWith(
        'user@example.com',
        [0.1, 0.2, 0.3],
        TOP_K,
      );
      expect(mockGeminiService.createCompletion).toHaveBeenCalledWith(
        CHAT_SYSTEM_PROMPT_WITH_CONTEXT,
        expect.stringContaining('Relevant chunk 1'),
      );
      expect(mockGeminiService.createCompletion).toHaveBeenCalledWith(
        CHAT_SYSTEM_PROMPT_WITH_CONTEXT,
        expect.stringContaining('Relevant chunk 2'),
      );
      expect(mockGeminiService.createCompletion).toHaveBeenCalledWith(
        CHAT_SYSTEM_PROMPT_WITH_CONTEXT,
        expect.not.stringContaining('Low score chunk'),
      );
      expect(result).toEqual({
        answer: 'Here is the answer from the document.',
      });
    });

    it('uses no-context system prompt when zero matches exceed minimum relevance threshold', async () => {
      mockDocumentsService.findByEmail.mockResolvedValue(successDocument);
      mockGeminiService.createEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
      mockPineconeService.query.mockResolvedValue([
        { text: 'Irrelevant chunk', score: 0.12 },
      ]);
      mockGeminiService.createCompletion.mockResolvedValue(
        'I could not find information about that in your document.',
      );

      const result = await service.askQuestion(questionDto);

      expect(mockGeminiService.createCompletion).toHaveBeenCalledWith(
        CHAT_SYSTEM_PROMPT_NO_CONTEXT,
        'Question: What are the main features?',
      );
      expect(result).toEqual({
        answer: 'I could not find information about that in your document.',
      });
    });
  });
});
