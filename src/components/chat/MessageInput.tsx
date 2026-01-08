import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Send, Mic, X } from "lucide-react";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { messageAdded } from "@/store/chat/messages.slice";

import {
  emitSendMessage,
  emitTypingStart,
  emitTypingStop,
} from "@/socket/emitters";

export function MessageInput() {
  const dispatch = useAppDispatch();

  const activeConversationId = useAppSelector(
    (s) => s.ui.activeConversationId
  );

  const currentUserId = useAppSelector(
    (s) => s.auth.user?.id
  );

  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingRef = useRef(false);

  /* =========================
     Typing handlers (SAFE)
  ========================= */

  const startTyping = () => {
    if (!activeConversationId || typingRef.current) return;
    typingRef.current = true;
    console.log("[Typing] start", activeConversationId);
    emitTypingStart(activeConversationId);
  };

  const stopTyping = () => {
    if (!activeConversationId || !typingRef.current) return;
    typingRef.current = false;
    console.log("[Typing] stop", activeConversationId);
    emitTypingStop(activeConversationId);
  };

  /* =========================
     Submit handler (OPTIMISTIC)
  ========================= */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !activeConversationId || !currentUserId) return;

    const tempId = `temp-${Date.now()}`;

    console.log("[MessageInput] optimistic add", {
      conversationId: activeConversationId,
      tempId,
      content: message,
    });

    // 🔥 OPTIMISTIC MESSAGE
    dispatch(
      messageAdded({
        id: tempId,
        tempId,
        conversationId: activeConversationId,
        senderId: currentUserId,
        content: message,
        createdAt: new Date().toISOString(),
        status: "pending",
      })
    );

    // 🔥 EMIT TO SERVER
    emitSendMessage({
      conversationId: activeConversationId,
      content: message,
      tempId,
    });

    setMessage("");
    stopTyping();
  };

  /* =========================
     Input handlers
  ========================= */

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) startTyping();
    else stopTyping();
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 bg-card">
      <div className="flex items-end gap-2 rounded-2xl bg-secondary p-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onBlur={stopTyping}
          rows={1}
          placeholder="Type a message"
          className="flex-1 resize-none bg-transparent px-2 py-2 text-sm focus:outline-none"
        />

        {message.trim() ? (
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"
          >
            <Send className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}
