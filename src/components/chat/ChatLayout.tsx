// src/components/chat/ChatLayout.tsx

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { NetworkStatusBar } from './NetworkStatusBar';
import { CallHistory } from './CallHistory';
import { UsersList } from './UsersList';
import { NotificationPrompt } from './NotificationPrompt';

import { MessageSquare, Phone, UserPlus, MoreVertical, User, Settings, LogOut } from 'lucide-react';

import type { CallRecord, CallType } from '@/types/chat';
import { useTranslate } from '@/hooks/useTranslate';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import { logout } from '@/store/auth/auth.thunks';
import { ProfileDrawer } from '@/features/profile/ProfileDrawer';
import { SettingsDrawer } from '@/features/settings/SettingsDrawer';

type TabType = 'chats' | 'calls' | 'users';

export function ChatLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { translate } = useTranslate();

  const [activeTab, setActiveTab] = useState<TabType>('chats');
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const showConversationList = useAppSelector((state) => state.ui.showConversationList);

  /* ===============================
     CALL HISTORY
  ================================ */

  const rawCalls = useAppSelector((state) => state.calls.history);

  const callHistory: CallRecord[] = useMemo(
    () =>
      rawCalls.map((call, index) => ({
        id: `${call.fromUserId}-${index}`,
        type: call.type,
        user: {
          id: call.fromUserId,
          username: 'Unknown',
          email: '',
          avatar: '',
          isOnline: false,
        },
        timestamp: new Date(call.startedAt ?? Date.now()),
        duration:
          call.startedAt && call.endedAt
            ? (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000
            : 0,
        status:
          call.status === 'missed' ? 'missed' : call.status === 'ended' ? 'completed' : 'declined',
        isOutgoing: true,
      })),
    [rawCalls],
  );

  /* ===============================
     ACTIONS
  ================================ */

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    navigate('/', { replace: true }); // IMPORTANT: reset route
  };

  /* ===============================
     TABS
  ================================ */

  const tabs = [
    { id: 'chats', label: translate('tabs.chats'), icon: MessageSquare },
    {
      id: 'calls',
      label: translate('tabs.calls'),
      icon: Phone,
      count: callHistory.filter((c) => c.status === 'missed').length,
    },
    { id: 'users', label: translate('tabs.users'), icon: UserPlus },
  ];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background pb-safe">
      <div className="hidden md:block">
        <NetworkStatusBar />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ================= SIDEBAR ================= */}
        <div
          className={cn(
            'w-full md:w-72 lg:w-80 border-r border-border bg-card/50 flex flex-col',
            showConversationList ? 'flex' : 'hidden md:flex',
          )}
        >
          {/* TABS + MENU */}
          <div className="flex items-center border-b border-border bg-card">
            <div className="flex flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id as TabType)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium',
                      activeTab === tab.id
                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                        : 'text-muted-foreground hover:text-foreground',
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

            {/* 3 DOT MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-3 py-3 text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={() =>
                    window.innerWidth < 768 ? setProfileOpen(true) : navigate('/profile')
                  }
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() =>
                    window.innerWidth < 768 ? setSettingsOpen(true) : navigate('/settings')
                  }
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>

                {/* <DropdownMenuSeparator /> */}

                {/* <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem> */}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* SIDEBAR CONTENT */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chats' && <ConversationList />}
            {activeTab === 'calls' && (
              <CallHistory calls={callHistory} onCallBack={() => {}} translate={translate} />
            )}
            {activeTab === 'users' && (
              <UsersList
                isActive
                existingConversationUserIds={[]}
                onChatStarted={() => setActiveTab('chats')}
                translate={translate}
              />
            )}
          </div>
        </div>

        {/* ================= MAIN CHAT ================= */}
        <div className="flex-1 min-w-0">
          <ChatWindow />
        </div>
      </div>

      <NotificationPrompt translate={translate} />

      {/* ================= MOBILE DRAWERS ================= */}
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
