import { ChatMessage } from "@/store/chat/messages.slice";
import { Message } from "@/types/chat";

export function mapChatMessageToUI(
  msg: ChatMessage,
  currentUserId: string
): Message {
  return {
    id: msg.id,
    content: msg.content,
    senderId: msg.senderId,
    timestamp: new Date(msg.createdAt),
    status: msg.status,
    attachments: [],
    isOwn: msg.senderId === currentUserId,
  };
}



export function mapApiMessageToChatMessage(
  msg: any,
  conversationId: string
): ChatMessage {
  return {
    id: msg._id,
    tempId: undefined,
    conversationId: msg.conversationId ?? conversationId,
    senderId: msg.senderId,
    content: msg.content,
    createdAt: msg.createdAt, 
    status: "sent",
    isDeleted: msg.isDeleted ?? false,
  };
}


