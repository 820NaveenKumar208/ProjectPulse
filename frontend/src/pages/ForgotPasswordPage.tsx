import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { AuthLayout } from '../components/AuthLayout';
import { apiRequest } from '../lib/api';

export function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError('');
    setIsSubmitting(true);

    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({
          email: String(formData.get('email')),
        }),
      });
      setIsSubmitted(true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Reset request failed.');
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
        <h1 className="mt-5 text-4xl font-semibold tracking-normal">Reset access</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Enter your email and we will prepare a secure password reset flow.
        </p>
      </div>

      <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
            name="email"
            required
            type="email"
          />
        </label>

        {isSubmitted ? (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-pulse-success"
            initial={{ opacity: 0, y: -6 }}
          >
            Password reset delivery will be connected in the next auth hardening pass.
          </motion.p>
        ) : null}

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
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-pulse-text px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-slate-800"
          disabled={isSubmitting}
          type="submit"
        >
          <Mail className="h-4 w-4" />
          {isSubmitting ? 'Preparing...' : 'Continue'}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Remembered it?{' '}
        <Link className="font-semibold text-pulse-primary" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
