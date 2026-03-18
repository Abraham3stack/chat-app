"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const router = useRouter();
  const { token, authReady } = useAuth();

  useEffect(() => {
    if (authReady && token) {
      router.replace("/dashboard");
    }
  }, [authReady, token, router]);

  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <section className="grid w-full max-w-7xl gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="glass-panel rounded-[2rem] p-10">
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-emerald-400">
            Next.js Chat Experience
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.06em] text-slate-900 dark:text-white md:text-7xl">
            Realtime conversations with calm, modern energy.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
            Pulse Chat connects to your Node.js and Socket.io backend for live messages,
            presence updates, typing states, and smooth dashboard messaging.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/login"
              className="gradient-button rounded-2xl px-5 py-3 text-sm font-bold"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="soft-button rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="relative">
          <div className="glass-panel animate-float-in rounded-[2rem] p-5">
            <div className="mb-5 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-400/50 dark:bg-white/25" />
              <span className="h-3 w-3 rounded-full bg-slate-400/50 dark:bg-white/25" />
              <span className="h-3 w-3 rounded-full bg-slate-400/50 dark:bg-white/25" />
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-fit max-w-[80%] rounded-3xl bg-slate-900/5 px-4 py-3 text-sm text-slate-800 dark:bg-white/10 dark:text-slate-100">
                Hey, are you online?
              </div>
              <div className="ml-auto w-fit max-w-[80%] rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm text-white">
                Yep. Typing back now.
              </div>
              <div className="w-fit max-w-[80%] rounded-3xl bg-slate-900/5 px-4 py-3 text-sm text-slate-800 dark:bg-white/10 dark:text-slate-100">
                Nice. The dashboard feels like a real chat app now.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
