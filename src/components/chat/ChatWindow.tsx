import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as logoutThunk } from "@/store/auth/auth.thunks";

import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { CallOverlay, useCall } from "./CallOverlay";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MessageSquare,
  Phone,
  Video,
  LogOut,
  Users,
  ArrowLeft,
  Search,
  MoreVertical,
} from "lucide-react";

import { useTranslate } from "@/hooks/useTranslate";
import { mapApiMessageToChatMessage, mapChatMessageToUI } from "@/utils/mapChatMessage";
import { useGetConversationMessagesQuery } from "@/store/chat/messages.api";
import { messageAdded } from "@/store/chat/messages.slice";
import { useGetSidebarConversationsQuery } from "@/store/chat/conversations.api";

/* -----------------------------
   Helpers
------------------------------ */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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

/* -----------------------------
   Component
------------------------------ */

export function ChatWindow() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { translate: t } = useTranslate();

  const activeConversationId = useAppSelector(
  (state) => state.ui.activeConversationId
);
  const { data: sidebarResponse } = useGetSidebarConversationsQuery();

const conversations = sidebarResponse?.data ?? [];


  // UI
  const showConversationList = useAppSelector(
    (s) => s.ui.showConversationList
  );


  
const activeConversation = conversations.find(
  (c) => c.id === activeConversationId
);





const { data, isFetching } = useGetConversationMessagesQuery(
  { conversationId: activeConversationId! },
  { skip: !activeConversationId }
);



  // Messages
const messages = useAppSelector((s) =>
  activeConversationId
    ? s.messages.byConversation[activeConversationId] ?? []
    : []
);

  // Typing
const typingUsers = useAppSelector((s) =>
  activeConversationId
    ? s.typing.byConversation[activeConversationId] ?? []
    : []
);

  // Presence
  const onlineUserIds = useAppSelector((s) => s.presence.onlineUserIds);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { callState, initiateCall, endCall, toggleMute, toggleVideo } =
    useCall(t);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);
  const currentUserId = useAppSelector((s) => s.auth.user?.id ?? "");


  // hydrate messgaes

useEffect(() => {
  if (!data?.data || !activeConversationId) return;

  // Prevent duplicate hydration for this conversation
  if (messages.length > 0) return;

  data.data.forEach((apiMsg) => {
    dispatch(
      messageAdded(
        mapApiMessageToChatMessage(apiMsg, activeConversationId)
      )
    );
  });
}, [data, activeConversationId, messages.length, dispatch]);


  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  console.log("Active Conversation:", activeConversation);
  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center text-muted-foreground px-4">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No chat selected
          </h3>
          <p className="text-sm">{t("conversations.empty")}</p>
        </div>
      </div>
    );
  }

  const isGroup = activeConversation.isGroup;
  const displayName = isGroup
    ? activeConversation.groupName
    : activeConversation.user?.username ?? "Unknown";

  const isOnline = !isGroup
    ? onlineUserIds.includes(activeConversation.user?.id ?? "")
    : false;

  return (
    <>
      <div className="flex h-full flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => {}}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white",
                getAvatarColor(displayName)
              )}
            >
              {getInitials(displayName)}
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold truncate">{displayName}</h3>
              <p className="text-xs text-muted-foreground">
                {isOnline ? t("status.online") : t("status.offline")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isGroup && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    initiateCall("audio", activeConversation.user!)
                  }
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    initiateCall("video", activeConversation.user!)
                  }
                >
                  <Video className="h-5 w-5" />
                </Button>
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("action.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
       {messages.map((m) => (
  <MessageBubble
    key={m.id}
    message={mapChatMessageToUI(m, currentUserId)}
  />
))}

          {typingUsers.length > 0 && (
            <TypingIndicator userNames={typingUsers} translate={t} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <MessageInput />
      </div>

      <CallOverlay
        callState={callState}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        translate={t}
      />
    </>
  );
}
