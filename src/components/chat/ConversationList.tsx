import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setActiveConversationId } from "@/store/ui/ui.slice";

import { Conversation } from "@/types/chat";
import { cn } from "@/lib/utils";

import {
  MessageSquare,
  Users,
  Search,
  Plus,
  Timer,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { CreateGroupModal } from "./CreateGroupModal";

import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";

import { useGetSidebarConversationsQuery } from "@/store/chat/conversations.api";

/* ---------------------------
   Helpers
---------------------------- */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-primary",
    "bg-green-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-violet-500",
  ];
  return colors[name.charCodeAt(0) % colors.length];
}

function formatTime(date?: Date): string {
  if (!date) return "";
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d");
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
  isTyping: boolean;
   isOnline: boolean;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  isTyping,
  onClick,
isOnline,
}: ConversationItemProps) {
  console.log("Conversation Item data=>",conversation)
  const displayName = conversation.isGroup
    ? conversation.groupName
    : conversation.user?.username || "Unknown";


  const memberCount = conversation.isGroup
    ? conversation.users?.length
    : undefined;

  const lastMessageTime = conversation.lastMessage?.timestamp;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
       isActive
  ? "bg-primary/10 border border-primary/20 text-primary"
  : "hover:bg-secondary/80 border border-transparent text-muted-foreground"

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
              "flex h-12 w-12 items-center justify-center rounded-full text-white text-sm font-semibold",
              getAvatarColor(displayName)
            )}
          >
            {getInitials(displayName)}
          </div>
        )}

        {!conversation.isGroup && (
          <div
            className={cn(
              "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-sidebar",
              isOnline ? "bg-green-500" : "bg-muted"
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

          <div className="flex items-center gap-2">
            {lastMessageTime && (
              <span className="text-xs text-muted-foreground">
                {formatTime(lastMessageTime)}
              </span>
            )}
            {conversation.unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 text-xs text-white">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>

      <div
  className={cn(
    "text-sm truncate",
    isActive ? "text-primary" : "text-muted-foreground"
  )}
>

          {isTyping ? (
            <span className="flex items-center gap-1 text-primary">
              <TypingDots />
              typing…
            </span>
          ) : conversation.isGroup ? (
            `${memberCount} members`
          ) : (
            conversation.lastMessage?.content || "Start a conversation"
          )}
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

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  
const onlineUserIds = useAppSelector((s) => s.presence.onlineUserIds);

  /* ✅ RTK Query – correct usage */
const {
  data: response,
  isLoading,
} = useGetSidebarConversationsQuery();

const conversations = response?.data ?? [];



  console.log("Sidebar data=>",conversations)
  const activeConversationId = useAppSelector(
    (state) => state.ui.activeConversationId
  );

  const typingByConversation = useAppSelector(
    (state) => state.typing.byConversation
  );

  const filtered = conversations.filter((c) => {
    const name = c.isGroup ? c.groupName : c.user?.username;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Header */}
      <div className="p-3 border-b space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Conversations
          </h2>
          <button onClick={() => setShowCreateGroup(true)}>
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <div className="text-sm text-muted-foreground p-4">
            Loading conversations…
          </div>
        )}

    {!isLoading &&
  filtered.map((conversation) => (
    <ConversationItem
      key={conversation.id}
      conversation={conversation}
      isActive={conversation.id === activeConversationId}
       isOnline={
    !conversation.isGroup &&
    onlineUserIds.includes(conversation.user?.id ?? "")
  }
      isTyping={
        (typingByConversation[conversation.id]?.length ?? 0) > 0
      }
      onClick={() =>
        dispatch(setActiveConversationId(conversation.id))
      }
    />
  ))}

      </div>

      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        users={[]}
        onCreateGroup={() => {}}
        translate={(k) => k}
      />
    </div>
  );
}
