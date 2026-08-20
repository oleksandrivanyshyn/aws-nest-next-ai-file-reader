import { AlertTriangle } from 'lucide-react';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorPanelProps {
  message?: string;
  onRetry: () => void;
  onUploadDifferent: () => void;
}

export function ErrorPanel({
  message,
  onRetry,
  onUploadDifferent,
}: ErrorPanelProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-sm">
        <AlertTriangle />
        <AlertTitle>Couldn&apos;t read this document</AlertTitle>
        <AlertDescription>
          {message ??
            "This usually means the PDF is a scan rather than text. Try a different file, or one that isn't image-only."}
        </AlertDescription>
        <AlertAction className="flex gap-2 pt-1">
          <Button type="button" size="sm" onClick={onRetry}>
            Try again
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onUploadDifferent}
          >
            Upload a different file
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}
