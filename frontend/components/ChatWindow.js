"use client";

import { memo, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ChatInput from "./ChatInput";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

const getSenderId = (sender) => (typeof sender === "string" ? sender : sender?._id);

function ChatWindow({
  currentUser,
  selectedUser,
  messages,
  isTyping,
  loading,
  error,
  onSendMessage,
  onTyping,
  onOpenProfile,
  onBackToList,
  mobileChatOpen = false
}) {
  const endRef = useRef(null);
  const offlineTimeoutRef = useRef(null);
  const [presenceText, setPresenceText] = useState("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!selectedUser) {
      setPresenceText("");
      return;
    }

    if (offlineTimeoutRef.current) {
      clearTimeout(offlineTimeoutRef.current);
    }

    if (selectedUser.status === "online") {
      setPresenceText("Online now");
      return;
    }

    offlineTimeoutRef.current = setTimeout(() => {
      setPresenceText(
        selectedUser.lastSeen
          ? `Last seen ${new Date(selectedUser.lastSeen).toLocaleString()}`
          : "Offline"
      );
    }, 1500);

    return () => {
      if (offlineTimeoutRef.current) {
        clearTimeout(offlineTimeoutRef.current);
      }
    };
  }, [selectedUser]);

  if (!selectedUser) {
    return (
      <section className="glass-panel grid min-h-[520px] rounded-[2rem]">
        <div className="m-auto text-center text-slate-600 dark:text-slate-300">
          <h2 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-white">Select a conversation</h2>
          <p>Pick a contact from the sidebar to start messaging in real time.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass-panel grid h-full min-h-[520px] grid-rows-[auto_1fr_auto] overflow-hidden rounded-[2rem]">
      <header className="flex items-center justify-between gap-3 border-b border-slate-900/10 bg-slate-50/90 px-3 py-3 dark:border-white/10 dark:bg-white/5 md:px-5 md:py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBackToList}
            className="soft-button inline-flex h-10 w-10 items-center justify-center rounded-2xl lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-300 font-bold text-white md:h-12 md:w-12">
            {selectedUser.username?.slice(0, 1)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-lg text-slate-900 dark:text-white md:text-base">
              {selectedUser.username}
            </strong>
            <span className="block text-xs text-slate-500 dark:text-slate-300 md:text-sm">
              {presenceText}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenProfile?.(selectedUser)}
          className={`soft-button inline-flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium md:px-4 ${
            mobileChatOpen ? "ml-3" : ""
          }`}
        >
          View profile
          <ChevronRight size={16} />
        </button>
      </header>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.03),transparent)] px-3 py-4 md:px-5 md:py-6 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]">
        {loading ? <p className="m-auto text-center text-slate-500 dark:text-slate-300">Loading messages...</p> : null}
        {error ? <p className="m-auto text-center text-rose-400">{error}</p> : null}
        {!loading && messages.length === 0 ? (
          <p className="m-auto text-center text-slate-500 dark:text-slate-300">No messages yet. Say hello first.</p>
        ) : null}

        {messages.map((message) => (
          <MessageBubble
            key={message._id || `${message.timestamp}-${message.content}`}
            message={message}
            ownMessage={getSenderId(message.sender) === currentUser._id}
          />
        ))}

        {isTyping ? <TypingIndicator username={selectedUser.username} /> : null}
        <div ref={endRef} />
      </div>

      <ChatInput onSend={onSendMessage} onTyping={onTyping} disabled={!selectedUser} />
    </section>
  );
}

export default memo(ChatWindow);
