"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatInput({ onSend, onTyping, disabled }) {
  const [value, setValue] = useState("");
  const typingTimeoutRef = useRef(null);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    },
    []
  );

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setValue(nextValue);

    onTyping(Boolean(nextValue.trim()));

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1200);
  };

  const submit = (event) => {
    event.preventDefault();

    if (!value.trim()) {
      return;
    }

    onSend(value.trim());
    setValue("");
    onTyping(false);
  };

  return (
    <form
      className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-slate-900/10 bg-slate-100/95 px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-3 backdrop-blur-xl md:flex-row md:bg-slate-900/5 md:p-4 dark:border-white/10 dark:bg-slate-950/96 md:dark:bg-white/5"
      onSubmit={submit}
    >
      <input
        value={value}
        onChange={handleChange}
        placeholder={disabled ? "Choose a user to start chatting" : "Type a message"}
        disabled={disabled}
        className="flex-1 rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15 dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="gradient-button rounded-2xl px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        Send
      </button>
    </form>
  );
}
