import { cn } from '@/lib/utils';
import type { ChatMessage } from '../types/chat.types';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
        Ask anything about this document to get started.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            'max-w-[76%] rounded-[6px] px-3.5 py-2 text-[13px]',
            message.role === 'user'
              ? 'self-end bg-primary text-primary-foreground'
              : 'max-w-[82%] self-start border border-border bg-card',
          )}
        >
          {message.content}
          {message.sourceClause && (
            <span className="mt-1.5 block text-[11px] text-muted-foreground">
              From {message.sourceClause}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
