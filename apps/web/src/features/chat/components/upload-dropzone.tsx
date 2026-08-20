'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { validateFile } from '../utils/validate-file';

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
}

export function UploadDropzone({ onFileSelected }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    onFileSelected(file);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 text-center md:p-8">
      <div className="mb-1 text-sm font-semibold md:text-base">
        Upload a PDF to start
      </div>
      <p className="mb-4 text-sm text-muted-foreground md:mb-5 md:text-base">
        Drop a file here, or choose one. One document at a time.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          'flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border border-dashed p-8 md:max-w-md md:gap-4 md:p-10',
          isDragOver ? 'border-primary bg-accent' : 'border-border',
        )}
      >
        <Button
          type="button"
          className="md:h-10 md:px-5 md:text-base"
          onClick={() => inputRef.current?.click()}
        >
          Choose file
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive md:mt-4 md:text-base">
          {error}
        </p>
      )}
    </div>
  );
}
