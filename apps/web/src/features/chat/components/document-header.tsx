import { FileText, FileWarning } from 'lucide-react';
import { StatusChip } from './status-chip';
import type { DocumentDto } from '../types/chat.types';

interface DocumentHeaderProps {
  doc: DocumentDto | null | undefined;
  isUploading: boolean;
  uploadingFilename?: string;
}

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentHeader({
  doc,
  isUploading,
  uploadingFilename,
}: DocumentHeaderProps) {
  const filename = doc?.filename ?? uploadingFilename ?? 'No document';
  const meta = doc
    ? `${formatSize(doc.sizeBytes)}${doc.pageCount ? ` · ${doc.pageCount} pages` : ''}`
    : 'PDF, up to 10 MB';

  const { label, tone, iconOn } = (() => {
    if (isUploading)
      return { label: 'Uploading', tone: 'warn' as const, iconOn: false };
    if (!doc) return { label: 'Waiting', tone: 'idle' as const, iconOn: false };
    if (doc.status === 'pending')
      return { label: 'Processing', tone: 'warn' as const, iconOn: false };
    if (doc.status === 'error')
      return { label: 'Failed', tone: 'error' as const, iconOn: false };
    return { label: 'Ready', tone: 'ok' as const, iconOn: true };
  })();

  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={
            'grid size-8 shrink-0 place-items-center rounded text-[10px] font-bold tracking-wide ' +
            (doc?.status === 'error'
              ? 'bg-destructive/15 text-destructive'
              : iconOn
                ? 'bg-ok-bg text-primary'
                : 'bg-muted text-muted-foreground')
          }
        >
          {doc?.status === 'error' ? (
            <FileWarning className="size-4" />
          ) : (
            <FileText className="size-4" />
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{filename}</div>
          <div className="text-xs text-muted-foreground">{meta}</div>
        </div>
      </div>
      <StatusChip label={label} tone={tone} />
    </div>
  );
}
