import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  Circle,
  ExternalLink,
  Loader2,
  Calendar,
  CheckCircle2,
  Clock,
  ThumbsUp,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

import { Header } from '../components/Header';
import { notificationApi, type Notification } from '../lib/notificationApi';

const notificationTypeConfigs = {
  MILESTONE_COMPLETED: {
    icon: CheckCircle2,
    colorClass: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    label: 'Milestone Completed'
  },
  APPROVAL_REQUESTED: {
    icon: Clock,
    colorClass: 'text-amber-500 bg-amber-50 border-amber-100',
    label: 'Approval Requested'
  },
  APPROVAL_APPROVED: {
    icon: ThumbsUp,
    colorClass: 'text-sky-500 bg-sky-50 border-sky-100',
    label: 'Milestone Approved'
  },
  APPROVAL_REJECTED: {
    icon: XCircle,
    colorClass: 'text-rose-500 bg-rose-50 border-rose-100',
    label: 'Changes Requested'
  },
  REPORT_GENERATED: {
    icon: FileText,
    colorClass: 'text-indigo-500 bg-indigo-50 border-indigo-100',
    label: 'AI Report Generated'
  }
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadNotifications = async (targetPage = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await notificationApi.listNotifications(targetPage, 15);
      setNotifications(res.data);
      setTotalCount(res.meta.total);
      setTotalPages(res.meta.totalPages);
      setPage(res.meta.page);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <main className="min-h-screen bg-pulse-background text-pulse-text">
      <Header />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Notifications</h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Stay updated on milestone completions, approvals, and report generations.
              </p>
            </div>

            {notifications.some((n) => !n.read) && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <CheckCheck className="h-4 w-4 text-emerald-500" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setFilter('all')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'border-pulse-primary text-pulse-primary font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filter === 'unread'
                  ? 'border-pulse-primary text-pulse-primary font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Unread
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="inline-flex h-2 w-2 rounded-full bg-pulse-primary" />
              )}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Notification List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-pulse-primary" />
                <p className="mt-4 text-sm text-slate-500 font-medium">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <Bell className="h-12 w-12 text-slate-300 mb-3" />
                <p className="text-sm font-medium">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-xs text-slate-400 mt-1">We'll let you know when things happen.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <AnimatePresence initial={false}>
                  {filteredNotifications.map((notification) => {
                    const config = notificationTypeConfigs[notification.type] || {
                      icon: Bell,
                      colorClass: 'text-slate-500 bg-slate-50 border-slate-100',
                      label: 'System Notification'
                    };
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`group relative flex items-start gap-4 p-5 transition-colors hover:bg-slate-50/50 ${
                          !notification.read ? 'bg-pulse-primary/5' : ''
                        }`}
                      >
                        {/* Unread marker */}
                        <div className="flex h-10 items-center">
                          {!notification.read ? (
                            <Circle className="h-2 w-2 fill-pulse-primary text-pulse-primary shrink-0" />
                          ) : (
                            <div className="h-2 w-2 shrink-0" />
                          )}
                        </div>

                        {/* Icon */}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                              {config.label}
                            </span>
                            <span className="text-xs text-slate-300">•</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>

                          <h3 className={`mt-1 text-sm ${!notification.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {notification.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                            {notification.message}
                          </p>

                          {notification.projectId && (
                            <div className="mt-3">
                              <Link
                                to={`/projects/${notification.projectId}`}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-pulse-primary hover:text-pulse-primary/80 transition-colors"
                              >
                                View project details
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm hover:border-slate-300 hover:text-slate-600"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                <p className="text-xs text-slate-500">
                  Showing page <span className="font-semibold text-slate-700">{page}</span> of{' '}
                  <span className="font-semibold text-slate-700">{totalPages}</span> ({totalCount} total)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadNotifications(page - 1)}
                    disabled={page === 1 || isLoading}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => loadNotifications(page + 1)}
                    disabled={page === totalPages || isLoading}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
