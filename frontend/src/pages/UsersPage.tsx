import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminAPI, type AdminUser } from '../lib/adminApi';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { KPICard } from '../components/KPICard';
import {
  Users,
  Search,
  Plus,
  X,
  Building,
  UserPlus,
  Shield,
} from 'lucide-react';
import type { UserRole } from '../types/auth';

export function UsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager' as UserRole,
    organizationId: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchUsers = useCallback(() => {
    if (!accessToken) return;
    setIsLoading(true);
    adminAPI
      .listUsers(accessToken, {
        page,
        limit: 15,
        search,
        role: roleFilter,
      })
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to fetch user directory.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [accessToken, page, search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.organizationId.trim()) {
      setFormError('All fields are required.');
      return;
    }

    setModalLoading(true);
    setFormError(null);
    try {
      await adminAPI.createUser(accessToken, formData);
      setShowModal(false);
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'manager',
        organizationId: '',
      });
      setPage(1);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Failed to create user. Ensure email is unique.');
    } finally {
      setModalLoading(false);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded bg-slate-200 animate-pulse" />
        <LoadingState type="list" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" aria-label="Users page greeting">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Access Management</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            User Directory
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create, search, and configure platform user roles and organizational boundaries.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-violet-700"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add User Account
        </button>
      </section>

      {/* KPI summaries */}
      <section className="grid gap-4 sm:grid-cols-3" aria-label="KPIs">
        <KPICard
          label="Total Registered Users"
          value={total}
          icon={Users}
          description="Accounts configured on platform"
          index={0}
        />
        <KPICard
          label="Platform Managers"
          value={users.filter(u => u.role === 'manager').length}
          icon={Shield}
          description="Access to project timelines"
          index={1}
        />
        <KPICard
          label="Clients Invited"
          value={users.filter(u => u.role === 'client').length}
          icon={Building}
          description="Access to client portals"
          index={2}
        />
      </section>

      {/* Filter and Table Container */}
      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-950/20 transition dark:text-white"
            />
          </form>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 outline-none focus:border-violet-500 transition dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="manager">Managers</option>
              <option value="client">Clients</option>
            </select>
          </div>
        </div>

        {/* User List Table */}
        <div className="mt-6 overflow-x-auto">
          {error ? (
            <div className="py-6 text-center text-xs text-red-500">{error}</div>
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="No user accounts match the selected filters."
              icon={Users}
            />
          ) : (
            <table className="w-full border-collapse text-left text-sm text-slate-600 dark:text-slate-350">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 font-medium">
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">User Details</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">Platform Role</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">Organization ID</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider">Registered At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{userItem.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{userItem.email}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${
                          userItem.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                            : userItem.role === 'manager'
                            ? 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                        }`}
                      >
                        {userItem.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-xs text-slate-500">{userItem.organizationId}</td>
                    <td className="py-4 px-4 text-xs text-slate-400">
                      {new Date(userItem.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Create User Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />

          {/* Modal Container */}
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">Create User Account</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:border-violet-500 outline-none transition dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@agency.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:border-violet-500 outline-none transition dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:border-violet-500 outline-none transition dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Platform Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 text-sm border rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:border-violet-500 outline-none transition bg-white dark:bg-slate-900/60 dark:text-white"
                >
                  <option value="manager" className="dark:bg-slate-900">Manager (Agency Project Builder)</option>
                  <option value="client" className="dark:bg-slate-900">Client (Sign-off & Portal Viewer)</option>
                  <option value="admin" className="dark:bg-slate-900">Administrator (Platform Configurer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  Organization ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. org_acme"
                  value={formData.organizationId}
                  onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 focus:border-violet-500 outline-none transition dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition shadow flex items-center gap-1.5"
                >
                  {modalLoading ? 'Creating...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
