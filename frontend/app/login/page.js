"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, token, authReady, authLoading } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
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
      await login(form);
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
            Welcome back
          </p>
          <h1 className="mb-4 text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-slate-900 dark:text-white md:text-6xl">
            Login to your conversations.
          </h1>
          <p className="leading-8 text-slate-600 dark:text-slate-300">
            Use your email or username to jump back into your dashboard instantly.
          </p>
        </div>

        <form className="glass-panel flex rounded-[2rem] p-8" onSubmit={handleSubmit}>
          <div className="flex w-full flex-col gap-4">
          <label>
            <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">Email or Username</span>
            <input
              type="text"
              value={form.identifier}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, identifier: event.target.value }))
              }
              placeholder="jane or jane@example.com"
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
              placeholder="Minimum 6 characters"
              required
              className="w-full rounded-2xl border border-slate-900/10 bg-slate-900/5 px-4 py-3 text-slate-900 outline-none transition focus:-translate-y-0.5 focus:border-emerald-400/60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
          </label>

          {error ? <p className="m-0 text-sm text-rose-400">{error}</p> : null}

          <button
            type="submit"
            disabled={authLoading}
            className="gradient-button mt-2 rounded-2xl px-5 py-3 font-bold"
          >
            {authLoading ? "Logging in..." : "Login"}
          </button>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Need an account? <Link href="/register" className="text-emerald-400">Register</Link>
          </p>
          </div>
        </form>
      </section>
    </main>
  );
}
