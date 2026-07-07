import {
  BarChart3,
  Building2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderKanban,
  Home,
  Milestone,
  Bell,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

type NavItem = {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
};

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home, roles: ['admin', 'manager', 'client'] },
  { label: 'Organizations', path: '/organizations', icon: Building2, roles: ['admin'] },
  { label: 'Users', path: '/users', icon: Users, roles: ['admin'] },
  { label: 'Projects', path: '/projects', icon: FolderKanban, roles: ['admin', 'manager'] },
  { label: 'My Projects', path: '/projects', icon: FolderKanban, roles: ['client'] },
  { label: 'Milestones', path: '/milestones', icon: Milestone, roles: ['manager'] },
  { label: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['admin', 'manager', 'client'] },
  { label: 'Reports', path: '/reports', icon: FileText, roles: ['admin', 'manager', 'client'] },
  { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['admin'] },
  { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['manager'] },
  { label: 'Profile', path: '/profile', icon: User, roles: ['client'] },
  { label: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
};

export function Sidebar({ collapsed, onToggle, onMobileClose }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`flex h-full flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 dark:border-slate-800/50 px-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-xs font-extrabold tracking-tighter text-white shadow-md shadow-violet-500/20">
          PP
        </span>
        {!collapsed && (
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            ProjectPulse
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
        <ul className="space-y-1.5">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={`${item.label}-${item.path}`}>
                <Link
                  to={item.path}
                  onClick={onMobileClose}
                  className={`group flex items-center gap-3 rounded-r-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border-l-[3px] ${
                    active
                      ? 'bg-violet-500/10 dark:bg-violet-500/10 text-violet-750 dark:text-violet-300 border-l-[#7C3AED] shadow-sm font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-105 border-l-transparent'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                      active ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                    }`}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role Badge & Collapse Toggle */}
      <div className="border-t border-slate-100 dark:border-slate-800/50 px-3 py-3">
        {!collapsed && user && (
          <div className="mb-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
            <p className="mt-0.5 text-xs capitalize font-medium text-slate-600 dark:text-slate-350">{user.role}</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden w-full items-center justify-center rounded-lg p-2 text-slate-400 dark:text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-600 dark:hover:text-slate-300 md:flex"
          type="button"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
