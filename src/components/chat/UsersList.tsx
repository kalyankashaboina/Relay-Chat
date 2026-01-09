import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { User } from '@/types/chat';
import { useDebounce } from '@/hooks/useDebounce';

import { useGetUsersQuery } from '@/store/users/users.api';
import { useCreateConversationMutation } from '@/store/chat/conversations.api';
import { useAppDispatch } from '@/store/hooks';
import { setActiveConversationId } from '@/store/ui/ui.slice';

import { UserPlus, MessageSquare, Search, Users, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UsersListProps {
  existingConversationUserIds: string[];
  onChatStarted?: () => void;
  translate: (key: string) => string;
  isActive: boolean;
}

/* ===============================
   Helpers
================================ */

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = ['bg-primary', 'bg-green-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
  return colors[name.charCodeAt(0) % colors.length];
}

/* ===============================
   Component
================================ */

export function UsersList({
  existingConversationUserIds,
  onChatStarted,
  translate,
  isActive,
}: UsersListProps) {
  const dispatch = useAppDispatch();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  /* ===============================
     Users Query (single source of truth)
  ================================ */

  const { data, isFetching, isError } = useGetUsersQuery(
    {
      q: debouncedSearch,
      cursor,
      limit: 20,
    },
    {
      skip: !isActive,
      refetchOnMountOrArgChange: true,
    },
  );

  const users: User[] = data?.data ?? [];
  const nextCursor = data?.nextCursor;

  const [createConversation, { isLoading: isCreating }] = useCreateConversationMutation();

  /* ===============================
     Reset cursor on tab leave or search
  ================================ */

  useEffect(() => {
    if (!isActive) {
      setCursor(undefined);
    }
  }, [isActive]);

  useEffect(() => {
    setCursor(undefined);
  }, [debouncedSearch]);

  /* ===============================
     Infinite scroll
  ================================ */

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || isFetching || !nextCursor) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setCursor(nextCursor);
    }
  };

  /* ===============================
     Start chat
  ================================ */

  const handleStartChat = async (user: User) => {
    const res = await createConversation({ userId: user.id }).unwrap();
    dispatch(setActiveConversationId(res.data.id));
    onChatStarted?.();
  };

  /* ===============================
     Split users
  ================================ */

  const availableUsers = users.filter((u) => !existingConversationUserIds.includes(u.id));

  const existingUsers = users.filter((u) => existingConversationUserIds.includes(u.id));

  /* ===============================
     Render
  ================================ */

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-sidebar-border p-4">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{translate('users.available')}</h2>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={translate('input.searchUsers')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* List */}
      <div ref={listRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
        {/* Error */}
        {isError && <div className="py-10 text-center text-destructive">Failed to load users</div>}

        {/* Empty */}
        {!isFetching && users.length === 0 && (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center text-muted-foreground">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                <UserPlus className="h-8 w-8 opacity-50" />
              </div>
              <p className="font-medium">{translate('users.noResults')}</p>
            </div>
          </div>
        )}

        {/* Available users */}
        {availableUsers.length > 0 && (
          <div className="px-3 py-2 bg-primary/5">
            <span className="text-xs text-primary font-medium uppercase">Start New Chat</span>
          </div>
        )}

        {availableUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-4 border-b border-sidebar-border">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white',
                getAvatarColor(user.username),
              )}
            >
              {getInitials(user.username)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.username}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>

            <Button size="sm" disabled={isCreating} onClick={() => handleStartChat(user)}>
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Existing chats */}
        {existingUsers.length > 0 && (
          <div className="px-3 py-2 bg-muted/30">
            <span className="text-xs text-muted-foreground uppercase">Existing Chats</span>
          </div>
        )}

        {existingUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-4 border-b border-sidebar-border opacity-60"
          >
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white',
                getAvatarColor(user.username),
              )}
            >
              {getInitials(user.username)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.username}</p>
              <p className="text-xs text-muted-foreground">Already chatting</p>
            </div>

            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}

        {/* Loading */}
        {isFetching && (
          <div className="py-4 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
