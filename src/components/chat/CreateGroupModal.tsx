import { useEffect, useRef, useState } from 'react';
import type { User } from '@/types/chat';
import { cn } from '@/lib/utils';
import { X, Users, Check, Search } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

import { useAppSelector } from '@/store/hooks';
import { useGetUsersQuery } from '@/store/users/users.api';
import { useDebounce } from '@/hooks/useDebounce';

/* ===============================
   Props
================================ */

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, members: User[]) => void;
  translate: (key: string) => string;
}

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
   Component
================================ */

export function CreateGroupModal({
  open,
  onClose,
  onCreateGroup,
  translate,
}: CreateGroupModalProps) {
  const currentUserId = useAppSelector((s) => s.auth.user?.id);

  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [cursor, setCursor] = useState<string | undefined>(undefined);

  /* ===============================
     API CALL (SINGLE ENDPOINT)
  ================================ */

  const { data, isFetching, isError } = useGetUsersQuery(
    {
      q: debouncedSearch,
      cursor,
      limit: 20,
    },
    {
      skip: !open,
    },
  );

  const users = (data?.data ?? []).filter((u) => u.id !== currentUserId);
  const hasMore = data?.hasMore ?? false;
  const nextCursor = data?.nextCursor ?? null;

  const listRef = useRef<HTMLDivElement>(null);

  /* ===============================
     Reset pagination on open/search
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
     Selection logic
  ================================ */

  const toggleUser = (user: User) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user],
    );
  };

  const resetState = () => {
    setGroupName('');
    setSelectedUsers([]);
    setSearch('');
    setCursor(undefined);
  };

  const handleCreate = () => {
    if (!groupName.trim() || selectedUsers.length < 2) return;
    onCreateGroup(groupName.trim(), selectedUsers);
    resetState();
    onClose();
  };

  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
      onClose();
    }
  };

  /* ===============================
     Render
  ================================ */

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            {translate('group.create')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              {translate('group.name')}
            </label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={translate('group.namePlaceholder')}
              className="mt-1"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-2.5 py-1 text-sm"
                >
                  <span>{user.username.split(' ')[0]}</span>
                  <button onClick={() => toggleUser(user)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={translate('input.searchUsers')}
              className="pl-10"
            />
          </div>

          {/* User List */}
          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-60 overflow-y-auto space-y-1 rounded-lg border border-border p-1"
          >
            {/* Error */}
            {isError && (
              <div className="py-8 text-center text-sm text-destructive">Failed to load users</div>
            )}

            {/* Empty */}
            {!isFetching && !isError && users.length === 0 && (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {debouncedSearch ? translate('users.noResults') : translate('users.empty')}
              </div>
            )}

            {/* Users */}
            {users.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);

              return (
                <button
                  key={user.id}
                  onClick={() => toggleUser(user)}
                  className={cn(
                    'w-full flex items-center gap-3 p-2.5 rounded-lg transition-all',
                    isSelected
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted border border-transparent',
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

                  <div
                    className={cn(
                      'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30',
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                </button>
              );
            })}

            {/* Loader */}
            {isFetching && (
              <div className="py-2 text-center text-xs text-muted-foreground">Loading…</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => handleDialogChange(false)} className="flex-1">
              {translate('action.cancel')}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!groupName.trim() || selectedUsers.length < 2}
              className="flex-1"
            >
              {translate('group.createButton')} ({selectedUsers.length})
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {translate('group.minMembers')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
