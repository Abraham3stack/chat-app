"use client";

import { memo } from "react";

function Navbar({
  user,
  onLogout,
  onOpenProfile,
  pageTitle = "Dashboard",
  pageEyebrow = "Pulse Chat"
}) {
  if (!user) {
    return null;
  }

  return (
    <header className="glass-panel sticky top-2 z-30 mb-3 rounded-[1.7rem] px-4 py-3 md:top-4 md:mb-5 md:rounded-[2rem] md:px-5 md:py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mb-1 text-[0.68rem] uppercase tracking-[0.22em] text-emerald-400 md:text-[0.72rem] md:tracking-[0.18em]">
            {pageEyebrow}
          </p>
          <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-slate-900 dark:text-white md:text-2xl md:tracking-normal">
            {pageTitle}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <button
            type="button"
            className="rounded-2xl bg-rose-500 px-3 py-2.5 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-rose-600 md:px-4 md:py-3"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 md:mt-4 md:max-w-fit">
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex min-w-0 items-center gap-3 rounded-2xl bg-sky-50 px-3 py-2 transition hover:-translate-y-0.5 hover:bg-sky-100"
        >
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 font-bold text-white">
            {(user.username || "").slice(0, 1)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <strong className="block truncate text-slate-900">
              {user.username || "User"}
            </strong>
            <span className="block text-sm capitalize text-slate-500">
              {user.status || "offline"}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}

export default memo(Navbar);
