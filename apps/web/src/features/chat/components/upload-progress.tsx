import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface UploadProgressProps {
  percent: number;
  onCancel: () => void;
}

export function UploadProgress({ percent, onCancel }: UploadProgressProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
      <div className="w-full max-w-xs">
        <Progress value={percent} />
      </div>
      <p className="text-sm text-muted-foreground">
        {percent}% — sending to storage
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
