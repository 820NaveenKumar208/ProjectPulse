import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminCheckPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-pulse-background px-5 text-pulse-text">
      <motion.section
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-soft backdrop-blur-xl"
        initial={{ opacity: 0, y: 16 }}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-pulse-success">
          <Shield className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Admin access verified</h1>
        <p className="mt-4 leading-7 text-slate-600">
          This route is protected by role-based access on the frontend. The backend admin-check
          endpoint is also available for API verification.
        </p>
        <Link className="mt-8 inline-flex font-semibold text-pulse-primary" to="/app">
          Back to app
        </Link>
      </motion.section>
    </main>
  );
}
