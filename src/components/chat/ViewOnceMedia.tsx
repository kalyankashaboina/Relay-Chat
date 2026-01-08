import { useState, useEffect } from 'react';
import { FileAttachment } from '@/types/chat';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Lock, Image as ImageIcon, Video, Play } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ViewOnceMediaProps {
  attachment: FileAttachment;
  onView: () => void;
  isOwn: boolean;
  translate: (key: string) => string;
}

export function ViewOnceMedia({ attachment, onView, isOwn, translate }: ViewOnceMediaProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [hasViewed, setHasViewed] = useState(attachment.isViewed || false);

  useEffect(() => {
    if (isOpened && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isOpened && countdown === 0) {
      setIsOpened(false);
      setHasViewed(true);
      onView();
    }
  }, [isOpened, countdown, onView]);

  const handleOpen = () => {
    if (!hasViewed && !isOwn) {
      setIsOpened(true);
      setCountdown(5);
    }
  };

  const isImage = attachment.type === 'image';
  const isVideo = attachment.type === 'video';
  const MediaIcon = isVideo ? Video : ImageIcon;

  // Already viewed or own message
  if (hasViewed && !isOwn) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
        <EyeOff className="h-4 w-4" />
        <span>{translate('viewOnce.opened')}</span>
      </div>
    );
  }

  // Own message - show thumbnail with indicator
  if (isOwn) {
    return (
      <div className="relative rounded-lg overflow-hidden">
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          <Eye className="h-3 w-3" />
          <span>{translate('viewOnce.label')}</span>
        </div>
        {isImage && (
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-h-48 rounded-lg object-cover blur-sm"
          />
        )}
        {isVideo && (
          <div className="h-32 w-48 bg-muted rounded-lg flex items-center justify-center">
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Locked preview */}
      <button
        onClick={handleOpen}
        className={cn(
          'flex items-center gap-3 rounded-xl p-4 transition-all',
          'bg-gradient-to-br from-primary/20 to-primary/5',
          'border border-primary/20 hover:border-primary/40',
          'group',
        )}
      >
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <MediaIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Lock className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">{translate('viewOnce.label')}</p>
          <p className="text-xs text-muted-foreground">{translate('viewOnce.tapToView')}</p>
        </div>
        <Play className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
      </button>

      {/* View dialog */}
      <Dialog open={isOpened} onOpenChange={() => setIsOpened(false)}>
        <DialogContent className="max-w-lg p-0 overflow-hidden bg-black/95">
          {/* Countdown */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 text-white px-3 py-1.5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium">{countdown}s</span>
          </div>

          {/* Media */}
          <div className="flex items-center justify-center min-h-[300px]">
            {isImage && (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-h-[70vh] max-w-full object-contain"
              />
            )}
            {isVideo && (
              <video
                src={attachment.url}
                autoPlay
                controls={false}
                className="max-h-[70vh] max-w-full"
              />
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs">
            {translate('viewOnce.willDisappear')}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
