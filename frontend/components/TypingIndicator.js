"use client";

export default function TypingIndicator({ username }) {
  return (
    <div className="flex w-fit items-center gap-2 rounded-2xl border border-slate-900/10 bg-slate-900/5 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-400" />
      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-400 [animation-delay:150ms]" />
      <span className="h-2 w-2 animate-pulse-dot rounded-full bg-emerald-400 [animation-delay:300ms]" />
      <p className="m-0 text-sm text-slate-600 dark:text-slate-300">{username} is typing...</p>
    </div>
  );
}
