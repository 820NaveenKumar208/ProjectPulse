import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from './PageTransition';

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Background grid and radial gradients */}
      <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-[#0B1120] transition-colors pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-500/5 via-transparent to-transparent dark:from-violet-500/5 dark:via-transparent" />
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      {/* Mobile Sidebar (overlay drawer) */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sidebar container */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex w-full max-w-[280px] flex-1 flex-col bg-white dark:bg-slate-900 shadow-2xl h-full z-10"
            >
              {/* Close button inside sidebar header or relative position */}
              <div className="absolute right-4 top-4 z-50">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-350 dark:hover:border-slate-700 transition"
                  type="button"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Sidebar collapsed={false} onToggle={() => {}} onMobileClose={() => setMobileOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <Header onMenuClick={() => setMobileOpen(true)} collapsed={collapsed} />

        {/* Scrollable page body */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname}>
                <Outlet />
              </PageTransition>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
