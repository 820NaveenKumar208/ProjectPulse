import { LogOut, Menu, Moon, Search, Sun, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { useTheme } from '../contexts/ThemeContext';

type HeaderProps = {
  onMenuClick: () => void;
  collapsed: boolean;
};

export function Header({ collapsed: _collapsed, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-900/80 px-4 shadow-sm backdrop-blur-md sm:px-6 transition-colors">
      {/* Left side: Hamburger on mobile / Search on desktop */}
      <div className="flex flex-1 items-center gap-4">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 transition hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white md:hidden"
          type="button"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:flex flex-1 max-w-xl items-center">
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects, clients..."
              className="block w-full rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-violet-500 focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Right side: Notifications, Theme Toggle, Profile, Logout */}
      <div className="flex items-center gap-4 sm:gap-5">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <NotificationBell />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* User Profile Info on Desktop */}
        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">{user?.name}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 capitalize">{user?.role}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 font-bold border border-violet-200 dark:border-violet-800/50">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Sign out button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors sm:ml-1"
          onClick={() => void logout()}
          title="Sign out"
          type="button"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
