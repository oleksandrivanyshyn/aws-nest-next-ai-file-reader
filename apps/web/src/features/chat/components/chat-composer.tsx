'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatComposerProps {
  disabled: boolean;
  placeholder: string;
  onSend: (question: string) => void;
}

export function ChatComposer({
  disabled,
  placeholder,
  onSend,
}: ChatComposerProps) {
  const [value, setValue] = useState('');

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <div className="flex gap-2 border-t border-border p-4 md:gap-3 md:p-6">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 md:h-11 md:px-4 md:text-base"
      />
      <Button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={submit}
        className="md:h-11 md:px-6 md:text-base"
      >
        Send
      </Button>
    </div>
  );
}
