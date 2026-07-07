import { Bell, Check, Circle, ExternalLink } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { notificationApi, type Notification } from '../lib/notificationApi';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        notificationApi.getUnreadCount(),
        notificationApi.listNotifications(1, 5), // Fetch top 5 for dropdown
      ]);
      setUnreadCount(countRes.count);
      setNotifications(listRes.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative flex items-center justify-center rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-pulse-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-50 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-pulse-primary hover:text-pulse-primary/80 flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                  <Bell className="mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      to={notification.projectId ? `/projects/${notification.projectId}` : '/app'}
                      className={`block rounded-xl p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                        !notification.read ? 'bg-pulse-primary/5' : ''
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {!notification.read ? (
                            <Circle className="h-2 w-2 fill-pulse-primary text-pulse-primary" />
                          ) : (
                            <div className="h-2 w-2" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm ${!notification.read ? 'font-semibold text-slate-800 dark:text-slate-200' : 'font-medium text-slate-650 dark:text-slate-350'}`}>
                            {notification.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {new Date(notification.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="rounded p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-650 dark:hover:text-slate-300"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-2 border-t border-slate-100 dark:border-slate-800 px-3 pb-1 pt-2">
              <Link
                to="/app/notifications"
                className="flex items-center justify-center gap-1 w-full rounded-lg py-2 text-sm font-medium text-slate-655 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-pulse-primary"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
