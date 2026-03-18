"use client";

import { memo } from "react";
import UserItem from "./UserItem";

function Sidebar({
  users,
  currentUser,
  selectedUser,
  search,
  onSearchChange,
  onSelectUser,
  loading,
  mobileChatOpen = false
}) {
  return (
    <aside className="glass-panel flex h-full min-h-0 flex-col gap-4 overflow-hidden rounded-[2rem] p-4 md:p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="m-0 text-xs uppercase tracking-[0.18em] text-emerald-400">Pulse Chat</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white md:text-xl">
              Chats
            </h2>
          </div>
          {mobileChatOpen ? null : (
            <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-300">
              {users.length} contacts
            </span>
          )}
        </div>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by username or email"
          className="w-full rounded-2xl border border-slate-900/10 bg-slate-900/5 px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1 md:gap-3">
        {loading ? (
          <p className="my-4 text-center text-slate-500 dark:text-slate-300">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="my-4 text-center text-slate-500 dark:text-slate-300">No users found.</p>
        ) : (
          users.map((item) => (
            <UserItem
              key={item._id}
              user={item}
              currentUserId={currentUser._id}
              active={selectedUser?._id === item._id}
              onSelect={onSelectUser}
            />
          ))
        )}
      </div>
    </aside>
  );
}

export default memo(Sidebar);
