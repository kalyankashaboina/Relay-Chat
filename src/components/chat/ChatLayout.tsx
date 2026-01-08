// src/components/chat/ChatLayout.tsx

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";

import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { NetworkStatusBar } from "./NetworkStatusBar";
import { CallHistory } from "./CallHistory";
import { UsersList } from "./UsersList";
import { NotificationPrompt } from "./NotificationPrompt";

import { MessageSquare, Phone, UserPlus } from "lucide-react";
import type { CallRecord, CallType, User } from "@/types/chat";
import { useTranslate } from "@/hooks/useTranslate";

type TabType = "chats" | "calls" | "users";



export function ChatLayout() {
  const [activeTab, setActiveTab] = useState<TabType>("chats");

  const showConversationList = useAppSelector(
    (state) => state.ui.showConversationList
  );
  const { translate } = useTranslate();

  /* ===============================
     CALLS (RAW → UI MODEL)
  ================================ */

  const rawCalls = useAppSelector((state) => state.calls.history);

  const callHistory: CallRecord[] = useMemo(() => {
    return rawCalls.map((call, index) => ({
      id: `${call.fromUserId}-${index}`,
      type: call.type,
      user: {
        id: call.fromUserId,
        username: "Unknown",
        email: "",
        avatar: "",
        isOnline: false,
      },
      timestamp: call.startedAt
        ? new Date(call.startedAt)
        : new Date(),
      duration:
        call.startedAt && call.endedAt
          ? (new Date(call.endedAt).getTime() -
              new Date(call.startedAt).getTime()) /
            1000
          : 0,
      status:
        call.status === "missed"
          ? "missed"
          : call.status === "ended"
          ? "completed"
          : "declined",
      isOutgoing: true,
    }));
  }, [rawCalls]);

  /* ===============================
     USERS (NOT READY YET)
  ================================ */

  const users: User[] = [];
  const existingConversationUserIds: string[] = [];

  const handleCallBack = (user: User, type: CallType) => {
    console.log("[CALL BACK]", user, type);
  };

  const handleStartChat = (user: User) => {
    console.log("[START CHAT]", user);
  };

  const tabs = [
    {
      id: "chats" as const,
      label: translate("tabs.chats"),
      icon: MessageSquare,
    },
    {
      id: "calls" as const,
      label: translate("tabs.calls"),
      icon: Phone,
      count: callHistory.filter((c) => c.status === "missed").length,
    },
    {
      id: "users" as const,
      label: translate("tabs.users"),
      icon: UserPlus,
    },
  ];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <NetworkStatusBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "w-full flex-shrink-0 border-r border-border md:w-80 lg:w-96 flex flex-col bg-card/50",
            showConversationList ? "flex" : "hidden md:flex"
          )}
        >
          {/* Tabs */}
          <div className="flex border-b border-border bg-card">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium transition-all",
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count && tab.count > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-2 text-xs text-primary-foreground">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "chats" && <ConversationList />}

            {activeTab === "calls" && (
              <CallHistory
                calls={callHistory}
                onCallBack={handleCallBack}
                translate={translate}
              />
            )}

            {activeTab === "users" && (
              <UsersList
                users={users}
                existingConversationUserIds={existingConversationUserIds}
                onStartChat={handleStartChat}
                translate={translate}
              />
            )}
          </div>
        </div>

        {/* Main chat */}
        <div
          className={cn(
            "flex-1 flex flex-col min-w-0",
            showConversationList ? "hidden md:flex" : "flex"
          )}
        >
          <ChatWindow />
        </div>
      </div>

      <NotificationPrompt translate={translate} />
    </div>
  );
}
