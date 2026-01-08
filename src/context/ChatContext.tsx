import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  Message,
  FileAttachment,
  Conversation,
  User,
  QueuedItem,
  Language,
  CallRecord,
  MessageReaction,
  ReplyTo,
} from '@/types/chat';
import {
  mockSendMessage,
  mockUploadFile,
  mockReceiveReply,
  validateFile,
  getFileType,
} from '@/lib/mockApi';
import { mockTypingIndicator } from '@/lib/mockAuth';
import { t } from '@/lib/i18n';

interface ChatContextType {
  messages: Message[];
  conversations: Conversation[];
  activeConversation: Conversation | null;
  isOnline: boolean;
  queue: QueuedItem[];
  language: Language;
  currentUser: User;
  isTyping: boolean;
  typingUsers: string[];
  showConversationList: boolean;
  callHistory: CallRecord[];
  allUsers: User[];
  searchQuery: string;
  replyingTo: ReplyTo | null;
  isProcessingQueue: boolean;
  pinnedMessages: Message[];

  sendMessage: (
    content: string,
    attachments?: File[],
    options?: { isVanish?: boolean; viewOnce?: boolean },
  ) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  retryFileUpload: (messageId: string, fileId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  setActiveConversation: (conversation: Conversation) => void;
  toggleOnline: () => void;
  setLanguage: (lang: Language) => void;
  translate: (key: string) => string;
  setTyping: (isTyping: boolean) => void;
  setShowConversationList: (show: boolean) => void;
  addCallToHistory: (call: Omit<CallRecord, 'id'>) => void;
  startNewChat: (user: User) => void;
  setSearchQuery: (query: string) => void;
  createGroup: (name: string, members: User[]) => void;
  toggleVanishMode: (conversationId: string, enabled: boolean, timer?: number) => void;
  setReplyingTo: (replyTo: ReplyTo | null) => void;
  forwardMessage: (messageId: string, toConversationId: string) => void;
  markViewOnceAsViewed: (messageId: string, attachmentId: string) => void;
  pinMessage: (messageId: string) => void;
  unpinMessage: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const mockUsers: User[] = [
  { id: 'user-1', name: 'Sarah Chen', email: 'sarah@example.com', avatar: '', isOnline: true },
  { id: 'user-2', name: 'Alex Johnson', email: 'alex@example.com', avatar: '', isOnline: false },
  { id: 'user-3', name: 'Maria Garcia', email: 'maria@example.com', avatar: '', isOnline: true },
  { id: 'user-4', name: 'James Wilson', email: 'james@example.com', avatar: '', isOnline: true },
  { id: 'user-5', name: 'Emily Brown', email: 'emily@example.com', avatar: '', isOnline: false },
  { id: 'user-6', name: 'Michael Scott', email: 'michael@example.com', avatar: '', isOnline: true },
  { id: 'user-7', name: 'Rachel Green', email: 'rachel@example.com', avatar: '', isOnline: false },
];

const currentUser: User = {
  id: 'current-user',
  name: 'You',
  email: 'you@example.com',
  avatar: '',
  isOnline: true,
};

const initialConversations: Conversation[] = [
  ...mockUsers.slice(0, 3).map((user) => ({
    id: `conv-${user.id}`,
    user,
    isGroup: false,
    unreadCount: Math.floor(Math.random() * 5),
    typingUsers: [],
  })),
  {
    id: 'group-1',
    users: [mockUsers[0], mockUsers[1], mockUsers[2]],
    isGroup: true,
    groupName: 'Project Team',
    unreadCount: 3,
    typingUsers: [],
  },
];

const mockCallHistory: CallRecord[] = [
  {
    id: 'call-1',
    type: 'video',
    user: mockUsers[0],
    timestamp: new Date(Date.now() - 3600000),
    duration: 125,
    status: 'completed',
    isOutgoing: true,
  },
  {
    id: 'call-2',
    type: 'audio',
    user: mockUsers[1],
    timestamp: new Date(Date.now() - 7200000),
    duration: 0,
    status: 'missed',
    isOutgoing: false,
  },
  {
    id: 'call-3',
    type: 'audio',
    user: mockUsers[2],
    timestamp: new Date(Date.now() - 86400000),
    duration: 45,
    status: 'completed',
    isOutgoing: false,
  },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(
    initialConversations[0],
  );
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<QueuedItem[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showConversationList, setShowConversationList] = useState(true);
  const [callHistory, setCallHistory] = useState<CallRecord[]>(mockCallHistory);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyTo | null>(null);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const processingQueue = useRef(false);
  const typingCleanup = useRef<(() => void) | null>(null);
  const userTypingTimeout = useRef<NodeJS.Timeout | null>(null);
  const vanishTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Computed pinned messages
  const pinnedMessages = messages.filter((m) => m.isPinned);

  const translate = useCallback((key: string) => t(key as any, language), [language]);

  // Vanish message cleanup
  useEffect(() => {
    messages.forEach((msg) => {
      if (msg.isVanish && msg.vanishAt && !vanishTimers.current.has(msg.id)) {
        const timeLeft = new Date(msg.vanishAt).getTime() - Date.now();
        if (timeLeft > 0) {
          const timer = setTimeout(() => {
            setMessages((prev) => prev.filter((m) => m.id !== msg.id));
            vanishTimers.current.delete(msg.id);
          }, timeLeft);
          vanishTimers.current.set(msg.id, timer);
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        }
      }
    });
  }, [messages]);

  useEffect(() => {
    if (isOnline && queue.length > 0 && !processingQueue.current) {
      processQueue();
    }
  }, [isOnline, queue.length]);

  const processQueue = async () => {
    if (processingQueue.current || queue.length === 0) return;
    processingQueue.current = true;
    setIsProcessingQueue(true);
    const queueCopy = [...queue];
    for (const item of queueCopy) {
      if (!isOnline) break;
      // Update item status to processing
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'processing' as const } : q)),
      );
      if (item.type === 'message') {
        const message = item.data as Message;
        await processMessageSend(message);
      }
      setQueue((prev) => prev.filter((q) => q.id !== item.id));
    }
    processingQueue.current = false;
    setIsProcessingQueue(false);
  };

  const processMessageSend = async (message: Message) => {
    for (const attachment of message.attachments) {
      if (
        attachment.uploadStatus !== 'sent' &&
        attachment.uploadStatus !== 'delivered' &&
        attachment.uploadStatus !== 'read'
      ) {
        await processFileUpload(message.id, attachment);
      }
    }
    const result = await mockSendMessage(message);
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, status: result.status } : m)),
    );
    if (result.success) {
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id && m.status === 'sent' ? { ...m, status: 'delivered' } : m,
          ),
        );
      }, 500);
      setTimeout(
        () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === message.id && (m.status === 'sent' || m.status === 'delivered')
                ? { ...m, status: 'read' }
                : m,
            ),
          );
        },
        1000 + Math.random() * 1000,
      );
      if (typingCleanup.current) typingCleanup.current();
      typingCleanup.current = mockTypingIndicator(
        () => setIsTyping(true),
        () => setIsTyping(false),
      );
      const reply = await mockReceiveReply(message.content);
      setIsTyping(false);
      setMessages((prev) => [...prev, reply]);
    }
    return result;
  };

  const processFileUpload = async (messageId: string, file: FileAttachment) => {
    return new Promise<void>((resolve) => {
      mockUploadFile(file, (progress) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  attachments: m.attachments.map((a) =>
                    a.id === file.id ? { ...a, uploadProgress: progress } : a,
                  ),
                }
              : m,
          ),
        );
      }).then((result) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  attachments: m.attachments.map((a) =>
                    a.id === file.id
                      ? {
                          ...a,
                          uploadStatus: result.status,
                          uploadProgress: result.success ? 100 : 0,
                        }
                      : a,
                  ),
                }
              : m,
          ),
        );
        resolve();
      });
    });
  };

  const sendMessage = useCallback(
    async (
      content: string,
      files?: File[],
      options?: { isVanish?: boolean; viewOnce?: boolean },
    ) => {
      if (!content.trim() && (!files || files.length === 0)) return;

      const conv = activeConversation;
      const isVanish = options?.isVanish || conv?.isVanishMode;
      const vanishTimer = conv?.vanishTimer || 60;

      const messageId = `msg-${Date.now()}`;
      const attachments: FileAttachment[] = (files || []).map((file, index) => {
        const validation = validateFile(file);
        return {
          id: `file-${messageId}-${index}`,
          name: file.name,
          size: file.size,
          type: getFileType(file.type),
          mimeType: file.type,
          url: URL.createObjectURL(file),
          uploadProgress: 0,
          uploadStatus: validation.valid ? 'pending' : 'failed',
          isViewOnce: options?.viewOnce,
          isViewed: false,
        };
      });

      const newMessage: Message = {
        id: messageId,
        content,
        senderId: currentUser.id,
        timestamp: new Date(),
        status: 'pending',
        attachments,
        isOwn: true,
        reactions: [],
        isVanish,
        vanishTimer: isVanish ? vanishTimer : undefined,
        vanishAt: isVanish ? new Date(Date.now() + vanishTimer * 1000) : undefined,
        replyTo: replyingTo || undefined,
      };

      setMessages((prev) => [...prev, newMessage]);
      setReplyingTo(null);

      if (!isOnline) {
        setQueue((prev) => [
          ...prev,
          {
            id: `queue-${messageId}`,
            type: 'message',
            data: newMessage,
            retryCount: 0,
            maxRetries: 3,
            createdAt: new Date(),
            status: 'pending',
          },
        ]);
        return;
      }
      await processMessageSend(newMessage);
    },
    [isOnline, activeConversation, replyingTo],
  );

  const retryMessage = useCallback(
    async (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                status: 'pending',
                attachments: m.attachments.map((a) =>
                  a.uploadStatus === 'failed'
                    ? { ...a, uploadStatus: 'pending', uploadProgress: 0 }
                    : a,
                ),
              }
            : m,
        ),
      );
      if (!isOnline) {
        setQueue((prev) => [
          ...prev,
          {
            id: `queue-${messageId}-retry`,
            type: 'message',
            data: message,
            retryCount: 0,
            maxRetries: 3,
            createdAt: new Date(),
            status: 'pending',
          },
        ]);
        return;
      }
      await processMessageSend(message);
    },
    [messages, isOnline],
  );

  const retryFileUpload = useCallback(
    async (messageId: string, fileId: string) => {
      const message = messages.find((m) => m.id === messageId);
      const file = message?.attachments.find((a) => a.id === fileId);
      if (!message || !file) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                attachments: m.attachments.map((a) =>
                  a.id === fileId ? { ...a, uploadStatus: 'pending', uploadProgress: 0 } : a,
                ),
              }
            : m,
        ),
      );
      if (!isOnline) return;
      await processFileUpload(messageId, file);
    },
    [messages, isOnline],
  );

  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, content: newContent, isEdited: true, editedAt: new Date() }
          : m,
      ),
    );
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isDeleted: true, content: '' } : m)),
    );
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    const reaction: MessageReaction = {
      emoji,
      odontUserId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date(),
    };
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, reactions: [...(m.reactions || []), reaction] } : m,
      ),
    );
  }, []);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              reactions: (m.reactions || []).filter(
                (r) => !(r.emoji === emoji && r.odontUserId === currentUser.id),
              ),
            }
          : m,
      ),
    );
  }, []);

  const setActiveConversation = useCallback((conversation: Conversation) => {
    setActiveConversationState(conversation);
    setShowConversationList(false);
    setReplyingTo(null);
  }, []);

  const toggleOnline = useCallback(() => setIsOnline((prev) => !prev), []);

  const setTypingCallback = useCallback(
    (typing: boolean) => {
      if (userTypingTimeout.current) clearTimeout(userTypingTimeout.current);
      if (typing) {
        userTypingTimeout.current = setTimeout(() => {
          if (activeConversation?.isGroup) {
            const groupUsers = activeConversation.users || [];
            const typingCount = Math.floor(Math.random() * 2) + 1;
            setTypingUsers(
              groupUsers
                .sort(() => Math.random() - 0.5)
                .slice(0, typingCount)
                .map((u) => u.name),
            );
          }
        }, 500);
      } else {
        setTypingUsers([]);
      }
    },
    [activeConversation],
  );

  const addCallToHistory = useCallback((call: Omit<CallRecord, 'id'>) => {
    setCallHistory((prev) => [{ ...call, id: `call-${Date.now()}` }, ...prev]);
  }, []);

  const startNewChat = useCallback(
    (user: User) => {
      const existingConv = conversations.find((c) => !c.isGroup && c.user?.id === user.id);
      if (existingConv) {
        setActiveConversation(existingConv);
        return;
      }
      const newConv: Conversation = {
        id: `conv-${user.id}`,
        user,
        isGroup: false,
        unreadCount: 0,
        typingUsers: [],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
    },
    [conversations],
  );

  const createGroup = useCallback((name: string, members: User[]) => {
    const newGroup: Conversation = {
      id: `group-${Date.now()}`,
      users: members,
      isGroup: true,
      groupName: name,
      unreadCount: 0,
      typingUsers: [],
    };
    setConversations((prev) => [newGroup, ...prev]);
    setActiveConversation(newGroup);
  }, []);

  const toggleVanishMode = useCallback(
    (conversationId: string, enabled: boolean, timer = 60) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, isVanishMode: enabled, vanishTimer: timer } : c,
        ),
      );
      if (activeConversation?.id === conversationId) {
        setActiveConversationState((prev) =>
          prev ? { ...prev, isVanishMode: enabled, vanishTimer: timer } : prev,
        );
      }
    },
    [activeConversation],
  );

  const forwardMessage = useCallback(
    (messageId: string, toConversationId: string) => {
      const originalMessage = messages.find((m) => m.id === messageId);
      if (!originalMessage) return;

      const forwardedMessage: Message = {
        id: `msg-${Date.now()}`,
        content: originalMessage.content,
        senderId: currentUser.id,
        timestamp: new Date(),
        status: 'sent',
        attachments: originalMessage.attachments,
        isOwn: true,
        reactions: [],
        forwardedFrom: originalMessage.isOwn ? currentUser.name : 'Someone',
      };

      setMessages((prev) => [...prev, forwardedMessage]);
    },
    [messages],
  );

  const markViewOnceAsViewed = useCallback((messageId: string, attachmentId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              attachments: m.attachments.map((a) =>
                a.id === attachmentId ? { ...a, isViewed: true } : a,
              ),
            }
          : m,
      ),
    );
  }, []);

  const pinMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isPinned: true } : m)));
  }, []);

  const unpinMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isPinned: false } : m)));
  }, []);

  useEffect(() => {
    return () => {
      if (typingCleanup.current) typingCleanup.current();
      if (userTypingTimeout.current) clearTimeout(userTypingTimeout.current);
      vanishTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const value: ChatContextType = {
    messages,
    conversations,
    activeConversation,
    isOnline,
    queue,
    language,
    currentUser,
    isTyping,
    typingUsers,
    showConversationList,
    callHistory,
    allUsers: mockUsers,
    searchQuery,
    replyingTo,
    isProcessingQueue,
    pinnedMessages,
    sendMessage,
    retryMessage,
    retryFileUpload,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    setActiveConversation,
    toggleOnline,
    setLanguage,
    translate,
    setTyping: setTypingCallback,
    setShowConversationList,
    addCallToHistory,
    startNewChat,
    setSearchQuery,
    createGroup,
    toggleVanishMode,
    setReplyingTo,
    forwardMessage,
    markViewOnceAsViewed,
    pinMessage,
    unpinMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
}
