'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProcessingStepsProps {
  onCancel?: () => void;
  isCancelling?: boolean;
}

export function ProcessingSteps({
  onCancel,
  isCancelling,
}: ProcessingStepsProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 md:p-8">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-primary" />
        <span className="text-sm font-medium text-foreground md:text-base">
          Processing document & generating index…
        </span>
      </div>
      <p className="text-xs text-muted-foreground md:text-sm">
        This usually takes a few seconds depending on document length.
      </p>
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isCancelling}
          className="mt-2 md:h-9 md:px-4 md:text-sm"
        >
          {isCancelling ? 'Cancelling…' : 'Cancel & upload different file'}
        </Button>
      )}
    </div>
  );
}
