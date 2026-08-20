import { cn } from '@/lib/utils';

type ChipTone = 'ok' | 'warn' | 'error' | 'idle';

interface StatusChipProps {
  label: string;
  tone: ChipTone;
}

const TONE_CLASSES: Record<ChipTone, string> = {
  ok: 'bg-ok-bg text-ok',
  warn: 'bg-warn-bg text-warn',
  error: 'bg-destructive/15 text-destructive',
  idle: 'bg-muted text-muted-foreground',
};

export function StatusChip({ label, tone }: StatusChipProps) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] md:px-3 md:py-1.5 md:text-xs font-semibold whitespace-nowrap',
        TONE_CLASSES[tone],
      )}
    >
      {label}
    </span>
  );
}
