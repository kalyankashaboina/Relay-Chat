import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { LanguageSelector } from './LanguageSelector';
import { TypingIndicator } from './TypingIndicator';
import { CallOverlay, useCall } from './CallOverlay';
import { VanishModeToggle } from './VanishModeToggle';
import { ReplyPreview } from './ReplyPreview';
import { MessageSearch } from './MessageSearch';
import { PinnedMessages } from './PinnedMessages';
import { OfflineQueueIndicator } from './OfflineQueueIndicator';
import { ThemeToggle } from './ThemeToggle';
import { cn } from '@/lib/utils';
import { MessageSquare, Phone, Video, LogOut, Users, ArrowLeft, Search, MoreVertical, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/store/auth/auth.thunks';

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = ['bg-primary', 'bg-green-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
  return colors[name.charCodeAt(0) % colors.length];
}

export function ChatWindow() {
  const { 
    messages, 
    activeConversation, 
    translate, 
    isTyping, 
    typingUsers,
    toggleVanishMode,
    replyingTo,
    setReplyingTo,
    setShowConversationList,
    queue,
    isOnline,
    isProcessingQueue,
    pinnedMessages,
    unpinMessage
  } = useChat();
  
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { callState, initiateCall, endCall, toggleMute, toggleVideo } = useCall(translate);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showPinned, setShowPinned] = useState(true);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (highlightedMessageId) {
      const timer = setTimeout(() => setHighlightedMessageId(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedMessageId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAudioCall = () => {
    if (activeConversation && !activeConversation.isGroup && activeConversation.user) {
      initiateCall('audio', activeConversation.user);
    }
  };

  const handleVideoCall = () => {
    if (activeConversation && !activeConversation.isGroup && activeConversation.user) {
      initiateCall('video', activeConversation.user);
    }
  };

  const handleVanishToggle = (enabled: boolean, timer: number) => {
    if (activeConversation) {
      toggleVanishMode(activeConversation.id, enabled, timer);
    }
  };

  const handleBack = () => {
    setShowConversationList(true);
  };

  const handleNavigateToMessage = (messageId: string) => {
    setHighlightedMessageId(messageId);
    setShowPinned(false);
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="text-center text-muted-foreground px-4">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <MessageSquare className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No chat selected</h3>
          <p className="text-sm">{translate('conversations.empty')}</p>
        </div>
      </div>
    );
  }

  const isGroup = activeConversation.isGroup;
  const displayName = isGroup ? activeConversation.groupName : activeConversation.user?.name;
  const isUserOnline = isGroup ? activeConversation.users?.some(u => u.isOnline) : activeConversation.user?.isOnline;
  const memberCount = isGroup ? activeConversation.users?.length : undefined;
  const typingNames = isGroup && typingUsers.length > 0 ? typingUsers : isTyping && activeConversation.user ? [activeConversation.user.name] : [];

  return (
    <>
      <div className="flex h-full flex-col bg-background relative">
        {showSearch && (
          <MessageSearch
            messages={messages}
            onClose={() => setShowSearch(false)}
            onNavigateToMessage={handleNavigateToMessage}
            translate={translate}
          />
        )}

        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-2 sm:px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="md:hidden text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="relative flex-shrink-0">
              {isGroup ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
                  <Users className="h-5 w-5" />
                </div>
              ) : (
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white',
                  getAvatarColor(displayName || '')
                )}>
                  {getInitials(displayName || '')}
                </div>
              )}
              {!isGroup && (
                <div className={cn(
                  'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card',
                  isUserOnline ? 'bg-green-500' : 'bg-muted'
                )} />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">{displayName}</h3>
              <p className={cn(
                'text-xs truncate',
                typingNames.length > 0 ? 'text-primary' : isUserOnline ? 'text-green-500' : 'text-muted-foreground'
              )}>
                {typingNames.length > 0
                  ? typingNames.length === 1 
                    ? `${typingNames[0]} ${translate('typing.indicator')}`
                    : `${typingNames.join(', ')} ${translate('typing.multiple')}`
                  : isGroup
                    ? `${memberCount} ${translate('group.members')}`
                    : isUserOnline
                      ? translate('status.online')
                      : translate('status.offline')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              className="text-muted-foreground hover:text-foreground hidden sm:flex"
              title={translate('action.search')}
            >
              <Search className="h-5 w-5" />
            </Button>

            <div className="hidden sm:block">
              <VanishModeToggle
                isEnabled={activeConversation.isVanishMode || false}
                timer={activeConversation.vanishTimer || 60}
                onToggle={handleVanishToggle}
                translate={translate}
              />
            </div>

            {!isGroup && (
              <div className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAudioCall}
                  className="text-muted-foreground hover:text-foreground"
                  title={translate('action.call')}
                >
                  <Phone className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleVideoCall}
                  className="text-muted-foreground hover:text-foreground"
                  title={translate('action.videoCall')}
                >
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground md:hidden">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowSearch(true)}>
                  <Search className="h-4 w-4 mr-2" />{translate('action.search')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleVanishToggle(!activeConversation.isVanishMode, 60)}>
                  <Timer className="h-4 w-4 mr-2" />
                  {activeConversation.isVanishMode ? translate('vanish.turnOff') : translate('vanish.off')}
                </DropdownMenuItem>
                {!isGroup && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleAudioCall}>
                      <Phone className="h-4 w-4 mr-2" />{translate('action.call')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleVideoCall}>
                      <Video className="h-4 w-4 mr-2" />{translate('action.videoCall')}
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />{translate('action.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden lg:block">
              <LanguageSelector />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hidden md:flex"
              title={translate('action.logout')}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Pinned messages bar */}
        {showPinned && pinnedMessages.length > 0 && (
          <PinnedMessages
            pinnedMessages={pinnedMessages}
            onNavigate={handleNavigateToMessage}
            onUnpin={unpinMessage}
            onClose={() => setShowPinned(false)}
            translate={translate}
          />
        )}

        {/* Offline queue indicator */}
        <OfflineQueueIndicator
          queue={queue}
          isOnline={isOnline}
          isProcessing={isProcessingQueue}
          translate={translate}
        />

        {/* Messages area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-background to-muted/20"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground px-4">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-sm">Start a conversation with {displayName}</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  id={`message-${message.id}`}
                  className={cn(
                    'transition-all duration-500',
                    highlightedMessageId === message.id && 'bg-primary/20 rounded-xl -mx-2 px-2 py-1'
                  )}
                >
                  <MessageBubble message={message} />
                </div>
              ))}
              {typingNames.length > 0 && (
                <TypingIndicator userNames={typingNames} translate={translate} />
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {replyingTo && (
          <div className="px-3 sm:px-4 pt-2 flex-shrink-0">
            <ReplyPreview replyTo={replyingTo} onCancel={() => setReplyingTo(null)} />
          </div>
        )}

        <div className="flex-shrink-0">
          <MessageInput />
        </div>
      </div>

      <CallOverlay
        callState={callState}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        translate={translate}
      />
    </>
  );
}
