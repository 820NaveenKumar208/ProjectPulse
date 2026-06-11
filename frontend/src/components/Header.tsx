import {
  Command,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Search,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from './NotificationBell';

export function Header() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <>
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-2 font-semibold" to="/app">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse-text text-white">
              <Command className="h-4 w-4" />
            </span>
            <span>ProjectPulse</span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            <Link
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                location.pathname === '/app'
                  ? 'bg-slate-100 font-semibold text-pulse-text'
                  : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-pulse-text'
              }`}
              to="/app"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                isActive('/projects')
                  ? 'bg-slate-100 font-semibold text-pulse-text'
                  : 'font-medium text-slate-500 hover:bg-slate-50 hover:text-pulse-text'
              }`}
              to="/projects"
            >
              <FolderKanban className="h-4 w-4" />
              Projects
            </Link>
            {/* Approvals and Reports tabs placeholder - can be implemented as full pages later */}
            <button
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-pulse-text"
              type="button"
            >
              Approvals
            </button>
            <button
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-pulse-text"
              type="button"
            >
              Reports
            </button>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-pulse-text sm:flex"
              title="Search"
              type="button"
            >
              <Search className="h-4 w-4" />
            </button>
            
            <NotificationBell />

            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-pulse-text"
              onClick={() => void logout()}
              title="Sign out"
              type="button"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200/70 bg-white md:hidden">
        <nav
          aria-label="Mobile navigation"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2"
        >
          {['Overview', 'Projects', 'Approvals', 'Reports'].map((item) => (
            <Link
              key={item}
              to={item === 'Overview' ? '/app' : item === 'Projects' ? '/projects' : '#'}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                (item === 'Overview' && location.pathname === '/app') ||
                (item === 'Projects' && isActive('/projects'))
                  ? 'bg-slate-100 text-pulse-text'
                  : 'text-slate-500'
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
