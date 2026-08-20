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
    <div className="flex flex-1 items-center justify-center p-6 md:p-8">
      <Alert
        variant="destructive"
        className="max-w-sm md:max-w-md md:px-4 md:py-3"
      >
        <AlertTriangle className="md:size-5" />
        <AlertTitle className="md:text-base">
          Couldn&apos;t read this document
        </AlertTitle>
        <AlertDescription className="md:text-base">
          {message ??
            "This usually means the PDF is a scan rather than text. Try a different file, or one that isn't image-only."}
        </AlertDescription>
        <AlertAction className="flex gap-2 pt-1 md:gap-3 md:pt-2">
          <Button
            type="button"
            size="sm"
            className="md:h-9 md:px-4 md:text-sm"
            onClick={onRetry}
          >
            Try again
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="md:h-9 md:px-4 md:text-sm"
            onClick={onUploadDifferent}
          >
            Upload a different file
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}
