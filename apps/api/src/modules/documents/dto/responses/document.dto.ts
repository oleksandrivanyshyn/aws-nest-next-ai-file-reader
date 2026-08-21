import { DocumentRow, DocumentStatus } from '../../documents.types';

export class DocumentResponseDto {
  documentId!: string;
  fileName!: string;
  status!: DocumentStatus;
  errorMessage?: string;
  createdAt!: string;
}

export function toDocumentDto(row: DocumentRow): DocumentResponseDto {
  const dto: DocumentResponseDto = {
    documentId: row.documentId,
    fileName: row.fileName,
    status: row.status,
    createdAt: row.createdAt,
  };

  if (row.errorMessage !== undefined) {
    dto.errorMessage = row.errorMessage;
  }

  return dto;
}
