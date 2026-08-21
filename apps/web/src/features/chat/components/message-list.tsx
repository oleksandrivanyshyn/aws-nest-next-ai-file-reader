import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '../types/chat.types';

interface MessageListProps {
  messages: ChatMessage[];
}

export function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground md:text-base">
        Ask any question about the uploaded document.
      </div>
    );
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto p-4 md:p-6">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            'max-w-[85%] rounded-[6px] px-4 py-3 text-[13px] break-words [overflow-wrap:anywhere] md:text-base',
            message.role === 'user'
              ? 'self-end bg-primary font-medium text-primary-foreground whitespace-pre-wrap'
              : 'self-start border border-border bg-card text-card-foreground',
          )}
        >
          {message.role === 'user' ? (
            message.content
          ) : (
            <div className="prose prose-invert max-w-none text-[13px] leading-relaxed break-words [overflow-wrap:anywhere] md:text-base prose-p:my-1.5 prose-p:leading-relaxed prose-headings:my-2 prose-ul:my-1.5 prose-ul:list-disc prose-ul:pl-4 prose-ol:my-1.5 prose-ol:list-decimal prose-ol:pl-4 prose-li:my-0.5 prose-pre:my-2">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
          {message.sourceClause && (
            <span className="mt-1.5 block text-[11px] text-muted-foreground md:mt-2 md:text-xs">
              From {message.sourceClause}
            </span>
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
