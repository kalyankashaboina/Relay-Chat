import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useChat } from '@/features/chat/useChat';
import { useAuth } from '@/features/auth/useAuth';
import { useSwipeGesture } from '@/shared/hooks/useSwipeGesture';
import { useScrollPagination } from '@/shared/hooks/useScrollPagination';
import { cn } from '@/lib/utils';

import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { CallOverlay, useCall } from './CallOverlay';
import { MessageSearch } from './MessageSearch';
import { PinnedMessages } from './PinnedMessages';
import { OfflineQueueIndicator } from './OfflineQueueIndicator';
import { EncryptionBanner } from './EncryptionIndicator';
import { NewMessageIndicator } from './NewMessageIndicator';
import { ScrollToBottomButton } from './ScrollToBottomButton';
import { ReplyPreview } from './ReplyPreview';
import { StarredMessages } from './StarredMessages';
import { ContactDetails } from './ContactDetails';

interface ChatWindowProps {
  onOpenMediaGallery?: () => void;
}

export function ChatWindow({ onOpenMediaGallery }: ChatWindowProps) {
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
    unpinMessage,
    isLoadingMore,
    hasMoreMessages,
    lastMessageId,
    loadMoreMessages,
    starredMessages,
    unstarMessage,
    muteConversation,
    archiveConversation,
  } = useChat();

  const { logout } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevLastMessageIdRef = useRef<string | null>(null);

  const { callState, initiateCall, endCall, toggleMute, toggleVideo } = useCall(translate);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [showPinned, setShowPinned] = useState(true);
  const [showEncryption, setShowEncryption] = useState(false);
  const [showStarred, setShowStarred] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);

  const { isNearBottom, scrollToBottom, newMessagesCount, setNewMessagesCount, handleScroll } =
    useScrollPagination({
      containerRef: messagesContainerRef,
      hasMore: hasMoreMessages,
      isLoading: isLoadingMore,
      onLoadMore: loadMoreMessages,
      threshold: 100,
    });

  const { handlers: swipeHandlers } = useSwipeGesture({
    onSwipeRight: () => setShowConversationList(true),
  });

  useEffect(() => {
    if (isNearBottom) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isNearBottom]);

  useEffect(() => {
    if (
      lastMessageId &&
      prevLastMessageIdRef.current &&
      lastMessageId !== prevLastMessageIdRef.current &&
      !isNearBottom
    ) {
      setNewMessagesCount((prev) => prev + 1);
    }
    prevLastMessageIdRef.current = lastMessageId;
  }, [lastMessageId, isNearBottom, setNewMessagesCount]);

  useEffect(() => {
    setNewMessagesCount(0);
    prevLastMessageIdRef.current = null;
  }, [activeConversation?.id, setNewMessagesCount]);

  useEffect(() => {
    if (!highlightedMessageId) return;
    const timer = setTimeout(() => setHighlightedMessageId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightedMessageId]);

  const handleBack = useCallback(() => {
    setShowConversationList(true);
    window.history.pushState({ conversationList: true }, '');
  }, [setShowConversationList]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleNavigateToMessage = useCallback((messageId: string) => {
    setHighlightedMessageId(messageId);
    setShowPinned(false);
    document
      .getElementById(`message-${messageId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleVanishToggle = useCallback(
    (enabled: boolean, timer: number) => {
      if (activeConversation) toggleVanishMode(activeConversation.id, enabled, timer);
    },
    [activeConversation, toggleVanishMode]
  );

  const handleAudioCall = useCallback(() => {
    if (activeConversation?.user) initiateCall('audio', activeConversation.user);
  }, [activeConversation, initiateCall]);

  const handleVideoCall = useCallback(() => {
    if (activeConversation?.user) initiateCall('video', activeConversation.user);
  }, [activeConversation, initiateCall]);

  if (!activeConversation) return <ChatPlaceholder translate={translate} />;

  const isGroup = activeConversation.isGroup;
  const displayName = isGroup ? activeConversation.groupName : activeConversation.user?.name;
  const activeTypingUsers = typingUsers[activeConversation.id] || [];
  const typingNames =
    isGroup && activeTypingUsers.length > 0
      ? activeTypingUsers
      : isTyping && activeConversation.user
        ? [activeConversation.user.name]
        : [];

  return (
    <>
      <motion.div
        className="relative flex h-full flex-col bg-background"
        {...swipeHandlers}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MessageSearch
                messages={messages}
                onClose={() => setShowSearch(false)}
                onNavigateToMessage={handleNavigateToMessage}
                translate={translate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <ChatHeader
          conversation={activeConversation}
          isOnline={isOnline}
          typingNames={typingNames}
          onBack={handleBack}
          onSearch={() => setShowSearch(true)}
          onVanishToggle={handleVanishToggle}
          onAudioCall={handleAudioCall}
          onVideoCall={handleVideoCall}
          onViewContact={() => setShowContactDetails(true)}
          onViewStarred={() => setShowStarred(true)}
          onToggleEncryption={() => setShowEncryption((p) => !p)}
          onOpenMediaGallery={onOpenMediaGallery}
          onMuteToggle={() => muteConversation(activeConversation.id, !activeConversation.isMuted)}
          onArchiveToggle={() =>
            archiveConversation(activeConversation.id, !activeConversation.isArchived)
          }
          onLogout={handleLogout}
          translate={translate}
        />

        <AnimatePresence>
          {showEncryption && <EncryptionBanner translate={translate} />}
        </AnimatePresence>

        <AnimatePresence>
          {showPinned && pinnedMessages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <PinnedMessages
                pinnedMessages={pinnedMessages}
                onNavigate={handleNavigateToMessage}
                onUnpin={unpinMessage}
                onClose={() => setShowPinned(false)}
                translate={translate}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <OfflineQueueIndicator
          queue={queue}
          isOnline={isOnline}
          isProcessing={isProcessingQueue}
          translate={translate}
        />

        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="relative flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-background to-muted/20 p-3 sm:space-y-4 sm:p-4"
        >
          <MessageList
            messages={messages}
            typingNames={typingNames}
            isLoadingMore={isLoadingMore}
            hasMoreMessages={hasMoreMessages}
            highlightedMessageId={highlightedMessageId}
            displayName={displayName ?? ''}
            translate={translate}
          />
          <div ref={messagesEndRef} />
        </div>

        <NewMessageIndicator
          count={newMessagesCount}
          onClick={() => scrollToBottom(true)}
          translate={translate}
        />
        <ScrollToBottomButton
          visible={!isNearBottom && newMessagesCount === 0}
          onClick={() => scrollToBottom(true)}
        />

        <AnimatePresence>
          {replyingTo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-shrink-0 px-3 pt-2 sm:px-4"
            >
              <ReplyPreview replyTo={replyingTo} onCancel={() => setReplyingTo(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="safe-bottom flex-shrink-0">
          <MessageInput />
        </div>
      </motion.div>

      <CallOverlay
        callState={callState}
        onEndCall={endCall}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        translate={translate}
      />

      <StarredMessages
        open={showStarred}
        onClose={() => setShowStarred(false)}
        starredMessages={starredMessages}
        onNavigateToMessage={handleNavigateToMessage}
        onUnstar={unstarMessage}
        translate={translate}
      />

      {!isGroup && activeConversation?.user && (
        <ContactDetails
          open={showContactDetails}
          onClose={() => setShowContactDetails(false)}
          user={activeConversation.user}
          messages={messages}
          isMuted={activeConversation.isMuted || false}
          isArchived={activeConversation.isArchived || false}
          onMuteToggle={() => muteConversation(activeConversation.id, !activeConversation.isMuted)}
          onArchiveToggle={() =>
            archiveConversation(activeConversation.id, !activeConversation.isArchived)
          }
          onCall={(type) => initiateCall(type, activeConversation.user!)}
          translate={translate}
        />
      )}
    </>
  );
}

function ChatPlaceholder({ translate }: { translate: (k: string) => string }) {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="px-4 text-center text-muted-foreground"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
          <MessageSquare className="h-10 w-10 text-primary/60" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">No chat selected</h3>
        <p className="text-sm">{translate('conversations.empty')}</p>
      </motion.div>
    </div>
  );
}
