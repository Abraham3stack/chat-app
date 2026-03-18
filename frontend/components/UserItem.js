"use client";

const formatMessageTime = (message) => {
  const value = message?.timestamp;
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getPreviewText = (message, currentUserId) => {
  if (!message) {
    return "Start a conversation";
  }

  const senderId = typeof message.sender === "string" ? message.sender : message.sender?._id;
  const prefix = senderId === currentUserId ? "You: " : "";
  return `${prefix}${message.content}`;
};

export default function UserItem({ user, currentUserId, active, onSelect }) {
  const previewTime = formatMessageTime(user.lastMessage);

  return (
    <button
      type="button"
      className={`flex gap-3 rounded-[1.35rem] border p-3 text-left transition duration-200 hover:-translate-y-0.5 md:p-3.5 ${
        active
          ? "border-emerald-400/40 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 dark:bg-emerald-500/10"
          : "border-transparent bg-slate-900/5 dark:bg-white/5"
      }`}
      onClick={() => onSelect(user)}
    >
      <div className="relative">
        <div className="grid h-14 w-14 place-items-center rounded-[1.15rem] bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-300 text-lg font-bold text-white md:h-12 md:w-12 md:rounded-2xl md:text-base">
          {user.username?.slice(0, 1)?.toUpperCase()}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
            user.status === "online" ? "bg-emerald-400 shadow-lg shadow-emerald-500/40" : "bg-slate-500"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <strong className="truncate text-lg font-semibold text-slate-900 dark:text-white md:text-base">
            {user.username}
          </strong>
          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-300">
            {previewTime || (user.status === "online" ? "Online" : "Offline")}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-slate-600 dark:text-slate-300 md:text-sm">
          {getPreviewText(user.lastMessage, currentUserId)}
        </p>
      </div>
    </button>
  );
}
