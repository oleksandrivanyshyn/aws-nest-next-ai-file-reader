import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface UploadProgressProps {
  percent: number;
  onCancel: () => void;
}

export function UploadProgress({ percent, onCancel }: UploadProgressProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 md:gap-4 md:p-8">
      <div className="w-full max-w-xs md:max-w-sm">
        <Progress value={percent} className="md:h-2.5" />
      </div>
      <p className="text-sm text-muted-foreground md:text-base">
        {percent}% — sending to storage
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="md:h-9 md:px-4 md:text-sm"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  );
}
