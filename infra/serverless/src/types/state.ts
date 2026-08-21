export interface PipelineInput {
  bucket: string;
  key: string;
}

export interface DocumentContext extends PipelineInput {
  documentId: string;
  userEmail: string;
}

export interface ExtractTextResult extends DocumentContext {
  textKey: string;
  characters: number;
}

export interface ChunkTextResult extends DocumentContext {
  chunksKey: string;
  chunkCount: number;
}

export interface EmbedChunksResult extends DocumentContext {
  vectorsKey: string;
  chunkCount: number;
}

export interface IndexChunksResult extends DocumentContext {
  indexedCount: number;
}

export type ErrorInput = PipelineInput &
  Partial<DocumentContext> & {
    error: {
      Error?: string;
      Cause?: string;
    };
  };

export interface EmbeddedChunk {
  id: string;
  values: number[];
  metadata: {
    documentId: string;
    chunkIndex: number;
    text: string;
  };
}
