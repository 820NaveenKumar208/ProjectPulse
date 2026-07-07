import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Building2 } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Account Preferences</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Your Profile
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal details, platform roles, and organizational structure.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Card */}
        <section className="md:col-span-1 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 shadow-sm flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md text-3xl font-bold shadow-violet-500/10">
            {user?.name.charAt(0)}
          </div>
          <h3 className="mt-4 font-bold text-lg text-slate-950 dark:text-white">{user?.name}</h3>
          <span className="mt-1 inline-flex items-center rounded-full bg-violet-50 dark:bg-violet-900/20 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-400 capitalize border border-violet-100 dark:border-violet-850">
            {user?.role}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
            Registered member of ProjectPulse Client Visibility Platform.
          </p>
        </section>

        {/* Profile details */}
        <section className="md:col-span-2 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">Personal Information</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Platform credentials and identity markers.</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/30">
              <User className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/30">
              <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/30">
              <Shield className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">Security Role</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/30">
              <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">Organization ID</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.organizationId}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
