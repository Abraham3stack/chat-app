"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, token, authReady, authLoading } = useAuth();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    about: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (authReady && token) {
      router.replace("/dashboard");
    }
  }, [authReady, token, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await register(form);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center px-5 py-8">
      <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-[2rem] p-8">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-emerald-400">
            Create account
          </p>
          <h1 className="mb-4 text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-slate-900 dark:text-white md:text-6xl">
            Start chatting in realtime.
          </h1>
          <p className="leading-8 text-slate-600 dark:text-slate-300">
            Set up your profile, connect instantly, and start real-time conversations with live updates and a modern chat experience.
          </p>
        </div>

        <form className="glass-panel flex rounded-[2rem] p-8" onSubmit={handleSubmit}>
          <div className="flex w-full flex-col gap-4">
          <label>
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Username</span>
            <input
              type="text"
              value={form.username}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, username: event.target.value }))
              }
              placeholder="jane_doe"
              required
              className="w-full rounded-2xl border border-slate-900/10 bg-slate-900/5 px-4 py-3 text-slate-900 outline-none transition focus:-translate-y-0.5 focus:border-emerald-400/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="jane@example.com"
              required
              className="w-full rounded-2xl border border-slate-900/10 bg-slate-900/5 px-4 py-3 text-slate-900 outline-none transition focus:-translate-y-0.5 focus:border-emerald-400/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="At least 6 characters"
              required
              className="w-full rounded-2xl border border-slate-900/10 bg-slate-900/5 px-4 py-3 text-slate-900 outline-none transition focus:-translate-y-0.5 focus:border-emerald-400/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">About</span>
            <input
              type="text"
              value={form.about}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, about: event.target.value }))
              }
              placeholder="Available for conversation"
              className="w-full rounded-2xl border border-slate-900/10 bg-slate-900/5 px-4 py-3 text-slate-900 outline-none transition focus:-translate-y-0.5 focus:border-emerald-400/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>

          {error ? <p className="m-0 text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={authLoading}
            className="gradient-button mt-2 rounded-2xl px-5 py-3 font-bold"
          >
            {authLoading ? "Creating account..." : "Register"}
          </button>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Already have an account? <Link href="/login" className="text-emerald-400">Login</Link>
          </p>
          </div>
        </form>
      </section>
    </main>
  );
}
