import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { MessageLoadingIndicator } from './MessageLoadingIndicator';
import { cn } from '@/lib/utils';
import type { Message } from '@/features/chat/types';

interface MessageListProps {
  messages: Message[];
  typingNames: string[];
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  highlightedMessageId: string | null;
  displayName: string;
  translate: (key: string) => string;
}

const MessageItem = memo(function MessageItem({
  message,
  index,
  isHighlighted,
}: {
  message: Message;
  index: number;
  isHighlighted: boolean;
}) {
  return (
    <motion.div
      key={message.id}
      id={`message-${message.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.3 }}
      className={cn(
        'transition-all duration-500',
        isHighlighted && '-mx-2 rounded-xl bg-primary/20 px-2 py-1'
      )}
    >
      <MessageBubble message={message} />
    </motion.div>
  );
});

export const MessageList = memo(function MessageList({
  messages,
  typingNames,
  isLoadingMore,
  hasMoreMessages,
  highlightedMessageId,
  displayName,
  translate,
}: MessageListProps) {
  return (
    <>
      <AnimatePresence>
        {isLoadingMore && <MessageLoadingIndicator translate={translate} />}
      </AnimatePresence>

      {!hasMoreMessages && messages.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2 text-center">
          <span className="rounded-full bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            {translate('messages.noMoreHistory')}
          </span>
        </motion.div>
      )}

      {messages.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-full items-center justify-center"
        >
          <div className="px-4 text-center text-muted-foreground">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
              <MessageSquare className="h-8 w-8 opacity-50" />
            </div>
            <p className="text-sm">Start a conversation with {displayName}</p>
          </div>
        </motion.div>
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              index={index}
              isHighlighted={highlightedMessageId === message.id}
            />
          ))}
          <AnimatePresence>
            {typingNames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <TypingIndicator userNames={typingNames} translate={translate} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
});
