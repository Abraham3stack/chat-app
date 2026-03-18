"use client";

import { memo } from "react";

function MessageBubble({ message, ownMessage }) {
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <article
      className={`flex max-w-[92%] flex-col gap-2 rounded-[1.4rem] px-4 py-3 md:max-w-[78%] ${
        ownMessage
          ? "ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          : "border border-slate-900/10 bg-slate-900/5 text-slate-800 dark:border-white/10 dark:bg-white/10 dark:text-slate-100"
      }`}
    >
      <p>{message.content}</p>
      <div className="flex justify-end gap-2 text-[0.72rem] opacity-85">
        <span>{formattedTime}</span>
        {ownMessage ? <span>{message.read ? "Seen" : "Sent"}</span> : null}
      </div>
    </article>
  );
}

export default memo(MessageBubble);
