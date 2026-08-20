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
    <div className="flex gap-2 border-t border-border p-4">
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
        className="flex-1"
      />
      <Button
        type="button"
        disabled={disabled || !value.trim()}
        onClick={submit}
      >
        Send
      </Button>
    </div>
  );
}
