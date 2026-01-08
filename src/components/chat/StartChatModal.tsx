import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveConversationId } from '@/store/ui/ui.slice';

import { useCreateConversationMutation } from '@/store/chat/conversations.api';
import { useGetUsersQuery } from '@/store/users/users.api';

import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { MessageSquare } from 'lucide-react';

/* ===============================
   Helpers
================================ */

function getInitials(username: string): string {
  return username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(username: string): string {
  const colors = ['bg-primary', 'bg-green-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
  return colors[username.charCodeAt(0) % colors.length];
}

/* ===============================
   Props
================================ */

interface StartChatModalProps {
  open: boolean;
  onClose: () => void;
}

/* ===============================
   Component
================================ */

export function StartChatModal({ open, onClose }: StartChatModalProps) {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((s) => s.auth.user?.id);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  const { data, isFetching, isError } = useGetUsersQuery({
    q: debouncedSearch,
    cursor,
    limit: 20,
  });

  const users = (data?.data ?? []).filter((u) => u.id !== currentUserId);
  const hasMore = data?.hasMore ?? false;
  const nextCursor = data?.nextCursor ?? null;

  const listRef = useRef<HTMLDivElement>(null);
  const [createConversation] = useCreateConversationMutation();

  /* ===============================
     Reset state on open / search
  ================================ */

  useEffect(() => {
    setCursor(undefined);
  }, [debouncedSearch, open]);

  /* ===============================
     Infinite scroll
  ================================ */

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || isFetching || !hasMore || !nextCursor) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setCursor(nextCursor);
    }
  };

  /* ===============================
     Start chat
  ================================ */

  const handleStartChat = async (userId: string) => {
    if (creatingId) return;

    try {
      setCreatingId(userId);
      const res = await createConversation({ userId }).unwrap();
      dispatch(setActiveConversationId(res.data.id));
      handleClose();
    } finally {
      setCreatingId(null);
    }
  };

  const handleClose = () => {
    setSearch('');
    setCursor(undefined);
    setCreatingId(null);
    onClose();
  };

  /* ===============================
     Render
  ================================ */

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            Start Chat
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />

        {/* List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="max-h-[320px] overflow-y-auto rounded-lg border border-border p-1 space-y-1"
        >
          {/* Error */}
          {isError && (
            <div className="py-8 text-center text-sm text-destructive">Failed to load users</div>
          )}

          {/* Empty */}
          {!isFetching && !isError && users.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">
              {debouncedSearch ? 'No users match your search' : 'No other users available'}
            </div>
          )}

          {/* Users */}
          {users.map((user) => (
            <button
              key={user.id}
              disabled={creatingId === user.id}
              onClick={() => handleStartChat(user.id)}
              className={cn(
                'w-full flex items-center gap-3 p-2.5 rounded-lg transition-all',
                creatingId === user.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted',
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white',
                  getAvatarColor(user.username),
                )}
              >
                {getInitials(user.username)}
              </div>

              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </button>
          ))}

          {/* Loading */}
          {isFetching && (
            <div className="py-2 text-center text-xs text-muted-foreground">Loading…</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
