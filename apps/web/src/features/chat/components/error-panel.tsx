import { AlertTriangle } from 'lucide-react';
import {
  Alert,
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
        className="max-w-md p-4 md:max-w-lg md:p-5"
      >
        <AlertTriangle className="size-5 shrink-0" />
        <div className="flex flex-col gap-1.5">
          <AlertTitle className="text-base font-semibold md:text-lg">
            Couldn&apos;t read this document
          </AlertTitle>
          <AlertDescription className="text-sm md:text-base">
            {message ??
              "This usually means the PDF is a scan rather than text. Try a different file, or one that isn't image-only."}
          </AlertDescription>
          <div className="mt-3 flex flex-wrap gap-2 md:mt-4 md:gap-3">
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
          </div>
        </div>
      </Alert>
    </div>
  );
}
