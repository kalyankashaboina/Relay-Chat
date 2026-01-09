import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveConversationId } from '@/store/ui/ui.slice';

import {
  useGetSidebarConversationsQuery,
  useSearchSidebarConversationsQuery,
  useCreateGroupConversationMutation,
} from '@/store/chat/conversations.api';

import type { Conversation } from '@/types/chat';
import { cn } from '@/lib/utils';

import { MessageSquare, Users, Search, Plus, Timer } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { CreateGroupModal } from './CreateGroupModal';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { format, isToday, isYesterday } from 'date-fns';
import { motion } from 'framer-motion';
import { useTranslate } from '@/hooks/useTranslate';

/* ---------------------------
   Helpers
---------------------------- */

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

function formatTime(date?: Date): string {
  if (!date) return '';
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
}

/* ---------------------------
   Typing Indicator
---------------------------- */

function TypingDots() {
  return (
    <span className="flex items-center gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1 w-1 rounded-full bg-primary"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );
}

/* ---------------------------
   Conversation Item
---------------------------- */

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  typingUsers: string[];
  isOnline: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  typingUsers,
  isOnline,
  onClick,
}: ConversationItemProps) {
  const displayName = conversation.isGroup
    ? conversation.groupName
    : conversation.user?.username || 'Unknown';

  const lastMessageTime = conversation.lastMessage?.timestamp;
  const isTyping = typingUsers.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
        isActive
          ? 'bg-primary/10 border border-primary/20 text-primary'
          : 'hover:bg-secondary/80 border border-transparent text-muted-foreground',
      )}
    >
      <div className="relative">
        {conversation.isGroup ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
            <Users className="h-5 w-5" />
          </div>
        ) : (
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-semibold',
              getAvatarColor(displayName),
            )}
          >
            {getInitials(displayName)}
          </div>
        )}

        {!conversation.isGroup && (
          <div
            className={cn(
              'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar',
              isOnline ? 'bg-green-500' : 'bg-muted',
            )}
          />
        )}

        {conversation.isVanishMode && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center">
            <Timer className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden text-left">
        <div className="flex justify-between items-center">
          <span className="font-medium truncate">{displayName}</span>
          {lastMessageTime && (
            <span className="text-xs text-muted-foreground">{formatTime(lastMessageTime)}</span>
          )}
        </div>

        <div className="text-sm truncate">
          {isTyping ? <TypingDots /> : conversation.lastMessage?.content || 'No messages yet'}
        </div>
      </div>
    </button>
  );
}

/* ---------------------------
   Conversation List
---------------------------- */

export function ConversationList() {
  const dispatch = useAppDispatch();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const activeConversationId = useAppSelector((s) => s.ui.activeConversationId);
  const { translate } = useTranslate();
  const onlineUserIds = useAppSelector((s) => s.presence.onlineUserIds);
  const typingByConversation = useAppSelector((s) => s.typing.byConversation);

  const listQuery = useGetSidebarConversationsQuery(undefined, {
    skip: !!searchQuery,
  });

  const searchQueryResult = useSearchSidebarConversationsQuery(
    { q: searchQuery },
    { skip: !searchQuery },
  );

  const data = searchQuery ? searchQueryResult.data : listQuery.data;
  const isLoading = searchQuery ? searchQueryResult.isLoading : listQuery.isLoading;

  const conversations = data?.data ?? [];

  const [createGroupConversation] = useCreateGroupConversationMutation();

  const handleCreateGroup = async (name: string, members: { id: string }[]) => {
    const memberIds = members.map((m) => m.id);
    const res = await createGroupConversation({ name, memberIds }).unwrap();
    dispatch(setActiveConversationId(res.data.id));
    setShowCreateGroup(false);
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="p-3 border-b space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conversations
          </h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <Plus className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCreateGroup(true)}>
                Create Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {!isLoading && conversations.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 text-primary/60" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs">
              Start one from the <b>New Chat</b> tab
            </p>
          </div>
        )}

        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === activeConversationId}
            isOnline={!conversation.isGroup && onlineUserIds.includes(conversation.user?.id ?? '')}
            typingUsers={typingByConversation[conversation.id] ?? []}
            onClick={() => dispatch(setActiveConversationId(conversation.id))}
          />
        ))}
      </div>

      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
        translate={translate}
      />
    </div>
  );
}
