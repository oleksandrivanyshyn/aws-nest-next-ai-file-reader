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
  pending: 'Chat unlocks when indexing finishes…',
  error: 'Chat unlocks once a document is ready…',
  indexed: 'Ask something about this document…',
} as const;

export function ChatView() {
  const { data: doc, isLoading } = useDocument();
  const { upload, cancel, progress, isUploading } = useUpload();
  const deleteDocument = useDeleteDocument();
  const { messages, ask, isAsking } = useChat(doc?.id);

  function resetAfterError() {
    if (doc) deleteDocument.mutate(doc.id);
  }

  const composerState = isUploading
    ? 'uploading'
    : !doc
      ? 'none'
      : doc.status === 'pending'
        ? 'pending'
        : doc.status === 'error'
          ? 'error'
          : 'indexed';

  return (
    <div className="min-h-svh bg-background md:flex md:items-center md:justify-center md:bg-muted/30 md:p-6">
      <div className="mx-auto flex h-svh w-full flex-col md:h-[min(860px,88svh)] md:max-w-2xl md:overflow-hidden md:rounded-xl md:border md:border-border md:shadow-sm lg:max-w-3xl">
        <DocumentHeader doc={doc} isUploading={isUploading} />

        {isLoading ? (
          <div className="flex flex-1 flex-col gap-3 p-4">
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="ml-auto h-10 w-1/2" />
          </div>
        ) : isUploading ? (
          <UploadProgress percent={progress} onCancel={cancel} />
        ) : !doc ? (
          <UploadDropzone onFileSelected={upload} />
        ) : doc.status === 'pending' ? (
          <ProcessingSteps currentStep={doc.currentStep} />
        ) : doc.status === 'error' ? (
          <ErrorPanel
            message={doc.errorMessage}
            onRetry={resetAfterError}
            onUploadDifferent={resetAfterError}
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
