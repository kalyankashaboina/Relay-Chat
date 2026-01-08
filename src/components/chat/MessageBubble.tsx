import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Reply,
  Forward,
  Timer,
  Pin,
  CheckCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Message } from '@/types/chat';
import { useTranslate } from '@/hooks/useTranslate';

import { emitDeleteMessage, emitSendMessage } from '@/socket/emitters';

import { MessageStatusIndicator } from './MessageStatusIndicator';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ReplyPreview } from './ReplyPreview';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (message: Message) => void;
}

export function MessageBubble({ message, onEdit }: MessageBubbleProps) {
  const { translate: t } = useTranslate();
  const dispatch = useAppDispatch();

  /* ---------------- Redux state ---------------- */

  const currentUserId = useAppSelector((s) => s.auth.user?.id);

  const onlineUserIds = useAppSelector((s) => s.presence.onlineUserIds);

  const activeConversationId = useAppSelector((s) => s.ui.activeConversationId);

  /* ---------------- Derived ---------------- */

  const isOwn = message.senderId === currentUserId;
  const isOnline = currentUserId ? onlineUserIds.includes(currentUserId) : false;

  /* ---------------- Local UI state ---------------- */

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /* ---------------- Handlers ---------------- */

  const handleRetry = () => {
    if (!activeConversationId) return;

    emitSendMessage({
      conversationId: activeConversationId,
      content: message.content,
      tempId: `retry-${Date.now()}`,
    });
  };

  const handleDelete = () => {
    emitDeleteMessage(message.id);
    setShowDeleteDialog(false);
  };

  /* ---------------- Deleted message ---------------- */

  if (message.isDeleted) {
    return (
      <div className={cn('flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
        <div className="rounded-2xl border border-dashed px-4 py-2 text-sm italic text-muted-foreground">
          {t('message.deleted')}
        </div>
      </div>
    );
  }

  /* ---------------- Render ---------------- */

  return (
    <div className={cn('group flex w-full', isOwn ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[75%] space-y-1">
        <div className="relative">
          <div
            className={cn(
              'rounded-2xl px-4 py-2.5 shadow-sm',
              isOwn
                ? 'rounded-br-md bg-primary text-primary-foreground'
                : 'rounded-bl-md bg-card border border-border',
              message.status === 'failed' && isOwn && 'ring-2 ring-destructive/50',
            )}
          >
            {message.isAI && (
              <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
                <Sparkles className="h-3 w-3" />
                <span>AI</span>
              </div>
            )}

            {message.replyTo && (
              <ReplyPreview replyTo={message.replyTo} isInMessage onCancel={() => {}} />
            )}

            {message.isVanish && (
              <div className="mb-1 flex items-center gap-1 text-xs opacity-70">
                <Timer className="h-3 w-3" />
                <span>{t('vanish.willDisappear')}</span>
              </div>
            )}

            {message.content &&
              (message.content.includes('**') || message.content.includes('```') ? (
                <MarkdownRenderer content={message.content} isOwn={isOwn} />
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              ))}
          </div>

          {/* Actions */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100',
              isOwn ? 'right-full mr-2' : 'left-full ml-2',
            )}
          >
            {isOwn && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full border bg-card p-1 shadow">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit?.(message)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('action.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('action.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={cn('flex items-center gap-2 text-xs', isOwn ? 'justify-end' : 'justify-start')}
        >
          <span className="text-muted-foreground">
            {format(new Date(message.timestamp), 'HH:mm')}
          </span>

          {isOwn && <MessageStatusIndicator status={message.status} translate={t} />}

          {isOwn && message.status === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={!isOnline}
              className="flex items-center gap-1 text-destructive"
            >
              <RefreshCw className="h-3 w-3" />
              {t('action.retry')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
