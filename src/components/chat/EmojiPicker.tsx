import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const EMOJI_CATEGORIES = {
  smileys: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '🥰', '😘', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲'],
  gestures: ['👍', '👎', '👌', '🤌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  objects: ['🎉', '🎊', '🎈', '🎁', '🏆', '⭐', '✨', '💡', '🔥', '💯', '✅', '❌', '⚠️', '📌', '📍', '💬', '💭', '🗯️', '📱', '💻', '⌨️', '🖥️', '📷', '📹', '🎵', '🎶', '🎤', '🎧', '📞', '📧'],
};

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('smileys');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  const categoryIcons: Record<keyof typeof EMOJI_CATEGORIES, string> = {
    smileys: '😀',
    gestures: '👍',
    hearts: '❤️',
    objects: '🎉',
  };

  return (
    <div ref={pickerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Smile className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-12 left-0 z-50 w-72 rounded-xl border border-border bg-card shadow-xl animate-fade-in">
          {/* Category tabs */}
          <div className="flex border-b border-border p-1">
            {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={cn(
                  'flex-1 rounded-lg p-2 text-lg transition-colors',
                  activeCategory === category
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {categoryIcons[category]}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto p-2">
            {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-muted"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
