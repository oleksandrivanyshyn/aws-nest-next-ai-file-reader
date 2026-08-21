import { FileText, FileWarning, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusChip } from './status-chip';
import type { DocumentDto } from '../types/chat.types';

interface DocumentHeaderProps {
  doc: DocumentDto | null | undefined;
  isUploading: boolean;
  uploadingFilename?: string;
  onDelete?: () => void;
  isDeleting?: boolean;
}

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function DocumentHeader({
  doc,
  isUploading,
  uploadingFilename,
  onDelete,
  isDeleting,
}: DocumentHeaderProps) {
  const filename = doc?.filename ?? uploadingFilename ?? 'No document';
  const meta = doc
    ? `${doc.sizeBytes ? formatSize(doc.sizeBytes) : 'PDF document'}${doc.pageCount ? ` · ${doc.pageCount} pages` : ''}`
    : 'PDF, up to 10 MB';

  const { label, tone, iconOn } = (() => {
    if (isUploading)
      return { label: 'Uploading', tone: 'warn' as const, iconOn: false };
    if (!doc) return { label: 'Waiting', tone: 'idle' as const, iconOn: false };
    if (doc.status === 'PENDING' || doc.status === 'PROCESSING')
      return { label: 'Processing', tone: 'warn' as const, iconOn: false };
    if (doc.status === 'ERROR')
      return { label: 'Failed', tone: 'error' as const, iconOn: false };
    return { label: 'Ready', tone: 'ok' as const, iconOn: true };
  })();

  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-6 md:py-4">
      <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
        <div
          className={
            'grid size-8 md:size-10 shrink-0 place-items-center rounded text-[10px] md:text-xs font-bold tracking-wide ' +
            (doc?.status === 'ERROR'
              ? 'bg-destructive/15 text-destructive'
              : iconOn
                ? 'bg-ok-bg text-primary'
                : 'bg-muted text-muted-foreground')
          }
        >
          {doc?.status === 'ERROR' ? (
            <FileWarning className="size-4 md:size-5" />
          ) : (
            <FileText className="size-4 md:size-5" />
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm md:text-base font-semibold">
            {filename}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">{meta}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusChip label={label} tone={tone} />
        {doc && onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isDeleting || isUploading}
            onClick={onDelete}
            title="Delete document"
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:size-9"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
