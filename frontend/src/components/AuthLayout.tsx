import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-pulse-background text-pulse-text">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <section className="flex items-center justify-center py-8">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </section>

        <section className="hidden items-center justify-center lg:flex">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-[680px] w-full max-w-2xl"
            initial={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            <div className="absolute inset-10 rounded-[2rem] border border-white/60 bg-white/55 shadow-soft backdrop-blur-xl" />
            <div className="absolute left-0 top-20 w-80 rounded-2xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Project health</span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-pulse-success">
                  On track
                </span>
              </div>
              <div className="mt-8 flex items-end gap-3">
                <span className="text-6xl font-semibold tracking-normal">84</span>
                <span className="pb-2 text-sm font-medium text-slate-500">/100</span>
              </div>
              <div className="mt-6 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-4/5 rounded-full bg-pulse-primary" />
              </div>
            </div>
            <div className="absolute right-0 top-56 w-96 rounded-2xl border border-white/70 bg-slate-950 p-5 text-white shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Milestone approval</span>
                <span className="rounded-full bg-amber-400/15 px-3 py-1 text-sm text-amber-200">
                  Awaiting client
                </span>
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Launch readiness review</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Final QA summary and release plan are ready for approval.
              </p>
            </div>
            <div className="absolute bottom-24 left-24 w-80 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-soft backdrop-blur-xl">
              <span className="text-sm font-medium text-slate-500">Weekly pulse</span>
              <div className="mt-5 space-y-3">
                <div className="h-2 w-full rounded-full bg-slate-200" />
                <div className="h-2 w-5/6 rounded-full bg-slate-200" />
                <div className="h-2 w-2/3 rounded-full bg-slate-200" />
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}
