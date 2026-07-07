import { CheckCircle2, FileText, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export function RecentActivityTimeline() {
  const activities = [
    {
      id: 1,
      type: 'approval',
      title: 'Client approved milestone',
      description: 'Landing Page Design for ProjectPulse Website was approved.',
      time: '10:30 AM',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    },
    {
      id: 2,
      type: 'comment',
      title: 'Changes requested',
      description: 'Manager requested changes on Admin Dashboard Wireframes.',
      time: '09:45 AM',
      icon: MessageSquare,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
    },
    {
      id: 3,
      type: 'report',
      title: 'Weekly report generated',
      description: 'AI-generated summary for SmartShop Buddy is ready.',
      time: 'Yesterday',
      icon: FileText,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-100 dark:bg-violet-900/30',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-subtle h-full">
      <h3 className="font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
      <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800 space-y-8">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className={`absolute -left-[35px] top-0 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white dark:border-[#0B1120] ${activity.bg} ${activity.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {activity.title}
                  </h4>
                  <p className="mt-1 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {activity.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-slate-550 dark:text-slate-400 whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
