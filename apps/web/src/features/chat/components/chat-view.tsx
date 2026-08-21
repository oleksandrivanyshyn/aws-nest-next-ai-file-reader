'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DocumentHeader } from './document-header';
import { UploadDropzone } from './upload-dropzone';
import { UploadProgress } from './upload-progress';
import { ProcessingSteps } from './processing-steps';
import { MessageList } from './message-list';
import { ErrorPanel } from './error-panel';
import { ChatComposer } from './chat-composer';
import { useDocument } from '../hooks/use-document';
import { useUpload } from '../hooks/use-upload';
import { useDeleteDocument } from '../hooks/use-delete-document';
import { useChat } from '../hooks/use-chat';

const COMPOSER_PLACEHOLDER = {
  none: 'Upload a document to start asking questions…',
  uploading: 'Chat unlocks once the document is ready…',
  processing: 'Chat unlocks when indexing finishes…',
  error: 'Chat unlocks once a document is ready…',
  indexed: 'Ask something about this document…',
} as const;

export function ChatView() {
  const { data: doc, isLoading } = useDocument();
  const { upload, cancel, progress, isUploading, fileName } = useUpload();
  const deleteDocument = useDeleteDocument();
  const { messages, ask, isAsking } = useChat(doc?.id);

  function removeDocument() {
    deleteDocument.mutate();
  }

  const isDocProcessing =
    doc?.status === 'PENDING' || doc?.status === 'PROCESSING';

  const composerState = isUploading
    ? 'uploading'
    : !doc
      ? 'none'
      : isDocProcessing
        ? 'processing'
        : doc.status === 'ERROR'
          ? 'error'
          : 'indexed';

  return (
    <div className="min-h-svh bg-background md:flex md:items-center md:justify-center md:bg-muted/30 md:p-6">
      <div className="mx-auto flex h-svh w-full flex-col md:h-[min(900px,90svh)] md:max-w-2xl md:overflow-hidden md:rounded-xl md:border md:border-border md:shadow-sm lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
        <DocumentHeader
          doc={doc}
          isUploading={isUploading}
          uploadingFilename={fileName}
          onDelete={removeDocument}
          isDeleting={deleteDocument.isPending}
        />

        {isLoading ? (
          <div className="flex flex-1 flex-col gap-3 p-4 md:gap-4 md:p-6">
            <Skeleton className="h-16 w-3/4 md:h-20" />
            <Skeleton className="ml-auto h-10 w-1/2 md:h-12" />
          </div>
        ) : isUploading ? (
          <UploadProgress percent={progress} onCancel={cancel} />
        ) : !doc ? (
          <UploadDropzone onFileSelected={upload} />
        ) : isDocProcessing ? (
          <ProcessingSteps
            currentStep={doc.currentStep}
            onCancel={removeDocument}
            isCancelling={deleteDocument.isPending}
          />
        ) : doc.status === 'ERROR' ? (
          <ErrorPanel
            message={doc.errorMessage}
            onRetry={removeDocument}
            onUploadDifferent={removeDocument}
          />
        ) : (
          <MessageList messages={messages} />
        )}

        <ChatComposer
          disabled={composerState !== 'indexed' || isAsking}
          placeholder={COMPOSER_PLACEHOLDER[composerState]}
          onSend={ask}
        />
      </div>
    </div>
  );
}
