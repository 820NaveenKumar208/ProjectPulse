import { Settings, Shield, Bell, Key, Database } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Preferences</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          System Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Configure notification dispatch, API integrations, and database access logs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Side: Navigation tabs */}
        <section className="md:col-span-1 space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-100/50 dark:border-violet-850" type="button">
            <Settings className="h-4 w-4 shrink-0" />
            General Settings
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition" type="button">
            <Bell className="h-4 w-4 shrink-0" />
            Notifications
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition" type="button">
            <Shield className="h-4 w-4 shrink-0" />
            Security & Roles
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 transition" type="button">
            <Key className="h-4 w-4 shrink-0" />
            API Credentials
          </button>
        </section>

        {/* Right Side: Tab content */}
        <section className="md:col-span-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 shadow-sm space-y-6">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">General Platform Configuration</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Global features and system variables.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">In-Memory Database Sync</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Auto-backup data to localStorage in dev mode.</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Real-Time Email Dispatches</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Send notification emails to client portals on milestone completions.</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly Summary PDF Dispatch</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Automatically trigger PDF status summaries every Monday morning.</p>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Database className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            <span>Currently running version: v1.0.2 (Staging Sandbox).</span>
          </div>
        </section>
      </div>
    </div>
  );
}
