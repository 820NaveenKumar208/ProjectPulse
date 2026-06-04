import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('manager');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError('');
    setIsSubmitting(true);

    try {
      await register({
        name: String(formData.get('name')),
        email: String(formData.get('email')),
        password: String(formData.get('password')),
        organizationId: String(formData.get('organizationId')),
        role,
      });
      navigate('/app', { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Registration failed.');
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
        <h1 className="mt-5 text-4xl font-semibold tracking-normal">Create your workspace</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Start with a secure account for project visibility and approval control.
        </p>
      </div>

      <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
              name="name"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Organization</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
              name="organizationId"
              required
            />
          </label>
        </div>

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

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            autoComplete="new-password"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-slate-700">Role</legend>
          <div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
            {(['admin', 'manager', 'client'] as UserRole[]).map((option) => (
              <button
                className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${
                  role === option ? 'bg-white text-pulse-text shadow-sm' : 'text-slate-500'
                }`}
                key={option}
                onClick={() => setRole(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

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
          {isSubmitting ? 'Creating account...' : 'Create account'}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link className="font-semibold text-pulse-primary" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
