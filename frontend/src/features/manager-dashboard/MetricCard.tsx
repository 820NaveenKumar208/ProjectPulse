import { CalendarClock, CheckCircle2, CircleDot, Clock3, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import type { MetricTone } from './dashboardData';

type MetricCardProps = {
  detail: string;
  index: number;
  label: string;
  tone: MetricTone;
  trend: string;
  value: string;
};

const toneStyles: Record<
  MetricTone,
  {
    icon: LucideIcon;
    iconClassName: string;
    trendClassName: string;
  }
> = {
  blue: {
    icon: CircleDot,
    iconClassName: 'bg-violet-50 dark:bg-violet-950/30 text-pulse-primary',
    trendClassName: 'text-pulse-primary',
  },
  green: {
    icon: CheckCircle2,
    iconClassName: 'bg-emerald-50 dark:bg-emerald-950/30 text-pulse-success',
    trendClassName: 'text-pulse-success',
  },
  amber: {
    icon: Clock3,
    iconClassName: 'bg-amber-50 dark:bg-amber-950/30 text-pulse-warning',
    trendClassName: 'text-pulse-warning',
  },
  red: {
    icon: CalendarClock,
    iconClassName: 'bg-red-50 dark:bg-red-950/30 text-pulse-danger',
    trendClassName: 'text-pulse-danger',
  },
};

export function MetricCard({ detail, index, label, tone, trend, value }: MetricCardProps) {
  const style = toneStyles[tone];
  const Icon = style.icon;

  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${style.iconClassName}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-xs font-semibold ${style.trendClassName}`}>{trend}</span>
      </div>
      <p className="mt-6 text-sm font-semibold text-slate-650 dark:text-slate-300">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-normal text-pulse-text dark:text-white">{value}</p>
      <p className="mt-3 text-xs leading-5 font-medium text-slate-600 dark:text-slate-350">{detail}</p>
    </motion.article>
  );
}
