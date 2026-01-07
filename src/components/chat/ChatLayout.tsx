import { useState } from 'react';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { NetworkStatusBar } from './NetworkStatusBar';
import { CallHistory } from './CallHistory';
import { UsersList } from './UsersList';
import { NotificationPrompt } from './NotificationPrompt';
import { AIChat } from './AIChat';
import { cn } from '@/lib/utils';
import { MessageSquare, Phone, UserPlus } from 'lucide-react';

type TabType = 'chats' | 'calls' | 'users';

function ChatContent() {
  const { showConversationList, callHistory, allUsers, conversations, startNewChat, translate } = useChat();
  const [activeTab, setActiveTab] = useState<TabType>('chats');

  const existingUserIds = conversations.filter(c => !c.isGroup && c.user).map(c => c.user!.id);
  const handleCallBack = (call: any) => console.log('Call back:', call);

  const tabs = [
    { id: 'chats' as const, label: translate('tabs.chats'), icon: MessageSquare, count: conversations.reduce((acc, c) => acc + c.unreadCount, 0) },
    { id: 'calls' as const, label: translate('tabs.calls'), icon: Phone, count: callHistory.filter(c => c.status === 'missed').length },
    { id: 'users' as const, label: translate('tabs.users'), icon: UserPlus },
  ];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <NetworkStatusBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div 
          className={cn(
            'w-full flex-shrink-0 border-r border-border md:w-80 lg:w-96 flex flex-col bg-card/50',
            showConversationList ? 'flex' : 'hidden md:flex'
          )}
        >
          {/* Tabs */}
          <div className="flex border-b border-border bg-card flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-medium transition-all relative touch-target',
                    activeTab === tab.id 
                      ? 'text-primary border-b-2 border-primary bg-primary/5' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 active:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute top-2 right-2 sm:static sm:ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                      {tab.count > 99 ? '99+' : tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chats' && <ConversationList />}
            {activeTab === 'calls' && <CallHistory calls={callHistory} onCallBack={handleCallBack} translate={translate} />}
            {activeTab === 'users' && <UsersList users={allUsers} existingConversationUserIds={existingUserIds} onStartChat={startNewChat} translate={translate} />}
          </div>
        </div>
        
        {/* Main chat area */}
        <div className={cn('flex-1 flex flex-col min-w-0', showConversationList ? 'hidden md:flex' : 'flex')}>
          <ChatWindow />
        </div>
      </div>
      
      {/* Notification prompt */}
      <NotificationPrompt translate={translate} />
      
      {/* AI Chat floating button */}
      {/* <AIChat translate={translate} /> */}
    </div>
  );
}

export function ChatLayout() {
  return (
    <ChatProvider>
      <ChatContent />
    </ChatProvider>
  );
}
