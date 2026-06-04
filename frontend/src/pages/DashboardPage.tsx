import { motion } from 'framer-motion';
import { LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-pulse-background px-5 py-6 text-pulse-text sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/75 p-5 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-pulse-primary">
              ProjectPulse
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Authentication ready</h1>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            onClick={() => void logout()}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </header>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 grid gap-5 md:grid-cols-[1.1fr_0.9fr]"
          initial={{ opacity: 0, y: 14 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-pulse-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-2xl font-semibold">Protected session active</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-600">
              This route is guarded by persisted authentication. Product dashboards will build on
              this shell in the next phases.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <p className="text-sm font-medium text-slate-500">Signed in as</p>
            <dl className="mt-5 space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Name
                </dt>
                <dd className="mt-1 font-medium">{user?.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Email
                </dt>
                <dd className="mt-1 font-medium">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Role
                </dt>
                <dd className="mt-1 inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold capitalize">
                  {user?.role}
                </dd>
              </div>
            </dl>
            {user?.role === 'admin' ? (
              <Link className="mt-6 inline-flex font-semibold text-pulse-primary" to="/admin">
                Verify admin route
              </Link>
            ) : null}
          </div>
        </motion.section>
      </div>
    </main>
  );
}
