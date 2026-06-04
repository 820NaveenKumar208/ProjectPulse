import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const destination = (location.state as LocationState | null)?.from?.pathname ?? '/app';
      navigate(destination, { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-pulse-primary">
          ProjectPulse
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-normal">Welcome back</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Sign in to review project health, approvals, and client-visible updates.
        </p>
      </div>

      <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        <div className="flex items-center justify-between text-sm">
          <Link className="font-medium text-pulse-primary" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        {error ? (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-pulse-danger"
            initial={{ opacity: 0, y: -6 }}
          >
            {error}
          </motion.p>
        ) : null}

        <button
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-pulse-text px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        New to ProjectPulse?{' '}
        <Link className="font-semibold text-pulse-primary" to="/register">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
