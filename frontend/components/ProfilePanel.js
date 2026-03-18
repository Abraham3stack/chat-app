"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Info,
  Mail,
  PencilLine,
  UserRound,
  X
} from "lucide-react";
import api from "../services/api";

const DEFAULT_ABOUT = "Hey there. I am enjoying realtime conversations on Pulse Chat.";

const formatPresence = (profileUser) => {
  if (profileUser?.status === "online") {
    return "Online now";
  }

  if (!profileUser?.lastSeen) {
    return "Offline";
  }

  return `Last seen ${new Date(profileUser.lastSeen).toLocaleString()}`;
};

const formatJoinDate = (date) => {
  if (!date) {
    return "Recently joined";
  }

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

export default function ProfilePanel({
  open,
  profileUser,
  isOwnProfile,
  loading,
  onClose,
  onProfileUpdated
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username: "", about: "" });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [panelError, setPanelError] = useState("");
  const usernameInputRef = useRef(null);

  const aboutText = (profileUser?.about || "").trim() || DEFAULT_ABOUT;

  useEffect(() => {
    if (!profileUser || isEditing || saveLoading) {
      return;
    }

    setForm({
      username: profileUser.username || "",
      about: (profileUser.about || "").trim() || DEFAULT_ABOUT
    });
  }, [isEditing, profileUser, saveLoading]);

  useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setSaveLoading(false);
      setSaveMessage("");
      setPanelError("");
    }
  }, [open]);

  const profileHighlights = useMemo(
    () => [
      {
        label: "Presence",
        value: formatPresence(profileUser),
        icon: BadgeCheck
      },
      {
        label: "About",
        value: aboutText,
        icon: Info
      },
      {
        label: "Joined",
        value: formatJoinDate(profileUser?.createdAt),
        icon: CalendarDays
      },
      {
        label: "Email",
        value: profileUser?.email || "Private",
        icon: Mail
      }
    ],
    [aboutText, profileUser]
  );

  const handleSave = async (event) => {
    event.preventDefault();

    const trimmedUsername = form.username.trim();
    const trimmedAbout = form.about.trim();

    if (!trimmedUsername) {
      setPanelError("Username is required");
      return;
    }

    try {
      setSaveLoading(true);
      setSaveMessage("");
      setPanelError("");

      const { data } = await api.put("/users/profile", {
        username: trimmedUsername,
        about: trimmedAbout === DEFAULT_ABOUT ? "" : trimmedAbout
      });

      onProfileUpdated?.(data);
      setForm({
        username: data.username || "",
        about: (data.about || "").trim() || DEFAULT_ABOUT
      });
      setIsEditing(false);
      setSaveMessage("Profile updated");
    } catch (error) {
      setPanelError(error.response?.data?.message || "Unable to update profile");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-0 bg-slate-950/45 backdrop-blur-sm transition duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute right-0 top-0 z-10 h-full w-full max-w-[720px] transform border-l border-slate-900/10 bg-slate-100/96 text-slate-900 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-white/10 dark:bg-slate-950/96 dark:text-slate-100 ${
          open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`flex h-full flex-col overflow-hidden transition duration-500 ${
            open ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-900/10 px-4 py-3 dark:border-white/10 md:px-5 md:py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-400">
                {isOwnProfile ? "Your profile" : "Contact profile"}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                {isOwnProfile ? "Manage your identity" : "View contact details"}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setPanelError("");
                    setSaveMessage("");
                    requestAnimationFrame(() => {
                      usernameInputRef.current?.focus();
                    });
                  }}
                  className="soft-button inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold"
                >
                  <PencilLine size={16} />
                  {isEditing ? "Editing profile" : "Edit profile"}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="soft-button inline-flex h-12 w-12 items-center justify-center rounded-2xl"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {loading && !profileUser ? (
              <div className="grid min-h-[260px] place-items-center text-slate-500 dark:text-slate-300">
                Loading profile...
              </div>
            ) : null}

            {!loading && !profileUser ? (
              <div className="grid min-h-[260px] place-items-center text-center text-slate-500 dark:text-slate-300">
                Select a user to view profile details.
              </div>
            ) : null}

            {profileUser ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
                <div className="space-y-4">
                  <div className="rounded-[1.9rem] border border-slate-900/10 bg-white/85 p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/72 dark:shadow-none">
                    <div className="mb-5 flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="grid h-24 w-24 place-items-center rounded-[1.8rem] bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-amber-300 text-3xl font-semibold text-white shadow-2xl shadow-fuchsia-500/20">
                          {profileUser.username?.slice(0, 1)?.toUpperCase() || "U"}
                        </div>
                        <span
                          className={`absolute bottom-1.5 right-1.5 h-4.5 w-4.5 rounded-full border-4 border-white dark:border-slate-950 ${
                            profileUser.status === "online"
                              ? "bg-emerald-400 shadow-lg shadow-emerald-500/40"
                              : "bg-slate-400 dark:bg-slate-600"
                          }`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-3xl font-semibold tracking-[-0.04em] text-slate-900 dark:text-white">
                          {profileUser.username || "Unknown user"}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                          {aboutText}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                            {formatPresence(profileUser)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                            Joined {formatJoinDate(profileUser.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                        <UserRound size={20} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Profile card
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-300">
                          Clear identity, presence, and account details in one place.
                        </p>
                      </div>
                    </div>

                    <dl className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5 dark:bg-slate-900/70 dark:shadow-none">
                        <dt className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Username
                        </dt>
                        <dd className="mt-2 text-base font-medium text-slate-900 dark:text-slate-100">
                          {profileUser.username || "Unknown user"}
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5 dark:bg-slate-900/70 dark:shadow-none">
                        <dt className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Status
                        </dt>
                        <dd className="mt-2 text-base font-medium text-slate-900 dark:text-slate-100">
                          {formatPresence(profileUser)}
                        </dd>
                      </div>
                      <div className="rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5 dark:bg-slate-900/70 dark:shadow-none sm:col-span-2">
                        <dt className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Date joined
                        </dt>
                        <dd className="mt-2 text-base font-medium text-slate-900 dark:text-slate-100">
                          {formatJoinDate(profileUser.createdAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {profileHighlights.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-4 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/68 dark:shadow-none"
                    >
                      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-300">
                        <Icon size={16} />
                        {label}
                      </div>
                      <p className="text-sm leading-7 text-slate-800 dark:text-slate-100">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.9rem] border border-slate-900/10 bg-white/85 p-5 shadow-sm shadow-slate-900/5 dark:border-white/10 dark:bg-slate-900/72 dark:shadow-none">
                  {isOwnProfile ? (
                    <form className="flex h-full flex-col" onSubmit={handleSave}>
                      <div className="mb-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400">
                          Edit details
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
                          Keep your profile fresh
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                          Update your username and bio without leaving the dashboard flow.
                        </p>
                      </div>

                      <div className="grid gap-4">
                        <label>
                          <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">
                            Username
                          </span>
                          <input
                            ref={usernameInputRef}
                            type="text"
                            value={form.username}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, username: event.target.value }))
                            }
                            onFocus={() => {
                              if (!isEditing) {
                                setIsEditing(true);
                              }
                            }}
                            disabled={saveLoading}
                            className="w-full rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                          />
                        </label>

                        <label className="flex min-h-[260px] flex-col">
                          <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">
                            Bio / About
                          </span>
                          <textarea
                            value={form.about}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, about: event.target.value }))
                            }
                            onFocus={() => {
                              if (!isEditing) {
                                setIsEditing(true);
                              }
                            }}
                            disabled={saveLoading}
                            rows={8}
                            className="min-h-[220px] w-full flex-1 resize-none rounded-2xl border border-slate-900/10 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/20 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
                          />
                        </label>
                      </div>

                      <div className="mt-auto pt-5">
                        {panelError ? <p className="mb-3 text-sm text-rose-500">{panelError}</p> : null}
                        {saveMessage ? (
                          <p className="mb-3 inline-flex items-center gap-2 text-sm text-emerald-500">
                            <Check size={16} />
                            {saveMessage}
                          </p>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            disabled={saveLoading}
                            className="gradient-button rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {saveLoading ? "Saving..." : "Save changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setForm({
                                username: profileUser.username || "",
                                about: (profileUser.about || "").trim() || DEFAULT_ABOUT
                              });
                              setIsEditing(false);
                              setPanelError("");
                              setSaveMessage("");
                            }}
                            className="soft-button rounded-2xl px-5 py-3 text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex h-full flex-col justify-between gap-6">
                      <div className="grid gap-4">
                        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/70">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Username
                          </p>
                          <p className="mt-2 text-lg font-medium text-slate-900 dark:text-slate-100">
                            {profileUser.username || "Unknown user"}
                          </p>
                        </div>
                        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/70">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            About
                          </p>
                          <p className="mt-2 text-sm leading-8 text-slate-700 dark:text-slate-200">
                            {aboutText}
                          </p>
                        </div>
                        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/70">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                            Joined
                          </p>
                          <p className="mt-2 text-base font-medium text-slate-900 dark:text-slate-100">
                            {formatJoinDate(profileUser.createdAt)}
                          </p>
                        </div>
                      </div>

                      {panelError ? <p className="text-sm text-rose-500">{panelError}</p> : null}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
