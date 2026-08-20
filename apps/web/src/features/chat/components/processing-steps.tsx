import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProcessingStep } from '../types/chat.types';

const STEPS: { key: ProcessingStep; label: string }[] = [
  { key: 'extract', label: 'Extracted text' },
  { key: 'chunk', label: 'Split into chunks' },
  { key: 'embed', label: 'Generated embeddings' },
  { key: 'index', label: 'Indexing for search' },
];

interface ProcessingStepsProps {
  currentStep?: ProcessingStep;
}

export function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  const currentIndex = currentStep
    ? STEPS.findIndex((s) => s.key === currentStep)
    : -1;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="flex w-full max-w-[260px] flex-col gap-2.5">
        {STEPS.map((step, index) => {
          const isDone = currentIndex >= 0 && index < currentIndex;
          const isNow = index === currentIndex;
          return (
            <div
              key={step.key}
              className={cn(
                'flex items-center gap-2.5 text-[13px]',
                !isDone && !isNow && 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'grid size-[15px] shrink-0 place-items-center rounded-full',
                  isDone && 'bg-ok-bg text-primary',
                  isNow && 'bg-warn-bg text-warn',
                  !isDone && !isNow && 'bg-muted text-muted-foreground',
                )}
              >
                {isDone ? (
                  <Check className="size-2.5" />
                ) : (
                  <span className="size-1 rounded-full bg-current" />
                )}
              </span>
              {step.label}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {currentIndex >= 0
          ? 'Usually under a minute.'
          : 'Processing your document…'}
      </p>
    </div>
  );
}
