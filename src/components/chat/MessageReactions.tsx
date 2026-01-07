import { useState } from 'react';
import { MessageReaction } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
  isOwn: boolean;
  currentUserId: string;
}

export function MessageReactions({
  reactions,
  onAddReaction,
  onRemoveReaction,
  isOwn,
  currentUserId,
}: MessageReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  if (reactions.length === 0 && !showPicker) {
    return (
      <div className={cn('flex items-center', isOwn ? 'justify-end' : 'justify-start')}>
        <button
          onClick={() => setShowPicker(true)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
        >
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = [];
    }
    acc[r.emoji].push(r);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const handleReactionClick = (emoji: string) => {
    const userReacted = reactions.some(r => r.emoji === emoji && r.odontUserId === currentUserId);
    if (userReacted) {
      onRemoveReaction(emoji);
    } else {
      onAddReaction(emoji);
    }
    setShowPicker(false);
  };

  return (
    <div className={cn('flex items-center gap-1 flex-wrap mt-1', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Existing reactions */}
      {Object.entries(groupedReactions).map(([emoji, reacts]) => {
        const userReacted = reacts.some(r => r.odontUserId === currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all',
              userReacted
                ? 'bg-primary/20 border border-primary/30'
                : 'bg-muted/80 hover:bg-muted border border-transparent'
            )}
            title={reacts.map(r => r.userName).join(', ')}
          >
            <span>{emoji}</span>
            {reacts.length > 1 && (
              <span className="text-muted-foreground font-medium">{reacts.length}</span>
            )}
          </button>
        );
      })}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors"
        >
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>

        {showPicker && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowPicker(false)} 
            />
            <div className={cn(
              'absolute z-50 flex gap-1 rounded-full bg-card border border-border shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-200',
              isOwn ? 'right-0' : 'left-0',
              'bottom-full mb-2'
            )}>
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReactionClick(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors text-lg hover:scale-110"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
