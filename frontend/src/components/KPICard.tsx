import { useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

function AnimatedNumber({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: 'easeOut' });
    return controls.stop;
  }, [value, count]);

  useEffect(() => {
    return rounded.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent = latest.toString();
      }
    });
  }, [rounded]);

  return <span ref={ref}>0</span>;
}

function AnimatedValue({ value }: { value: string | number }) {
  if (typeof value === 'number') {
    return <AnimatedNumber value={value} />;
  }

  const str = value.toString();
  const match = str.match(/^(\$)?(\d+)(%)?$/);
  if (match) {
    const prefix = match[1] || '';
    const num = parseInt(match[2], 10);
    const suffix = match[3] || '';
    return (
      <>
        {prefix}
        <AnimatedNumber value={num} />
        {suffix}
      </>
    );
  }

  return <>{value}</>;
}

type KPICardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral' | 'warning';
  };
  isLoading?: boolean;
  index?: number;
  onClick?: () => void;
  variant?: 'purple' | 'teal' | 'emerald' | 'amber';
};

const variantStyles = {
  purple: 'bg-violet-600 dark:bg-violet-950/50 text-white dark:text-violet-300 border-violet-750 dark:border-violet-900/40 shadow-violet-500/10',
  teal: 'bg-teal-600 dark:bg-teal-950/50 text-white dark:text-teal-300 border-teal-700/50 dark:border-teal-900/40 shadow-teal-500/10',
  emerald: 'bg-emerald-600 dark:bg-emerald-950/50 text-white dark:text-emerald-300 border-emerald-700/50 dark:border-emerald-900/40 shadow-emerald-500/10',
  amber: 'bg-amber-600 dark:bg-amber-950/50 text-white dark:text-amber-300 border-amber-700/50 dark:border-amber-900/40 shadow-amber-500/10',
};

export function KPICard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  isLoading = false,
  index = 0,
  onClick,
  variant = 'purple',
}: KPICardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-4 h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="mt-3 h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    );
  }

  const CardWrapper = onClick ? motion.button : motion.div;

  return (
    <CardWrapper
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`rounded-2xl border border-slate-200/80 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-6 shadow-[0_8px_32px_0_rgba(15,23,42,0.04)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.25)] text-left transition-all ${
        onClick ? 'cursor-pointer hover:border-violet-450/50 dark:hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/5 dark:hover:shadow-violet-950/20' : ''
      }`}
      type={onClick ? 'button' : undefined}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{label}</p>
          <div className="mt-2 flex items-baseline gap-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            <AnimatedValue value={value} />
            {trend && (
              <span
                className={`text-xs font-bold leading-none ${
                  trend.type === 'positive'
                    ? 'text-emerald-500 dark:text-emerald-400'
                    : trend.type === 'warning'
                    ? 'text-amber-500 dark:text-amber-400'
                    : trend.type === 'negative'
                    ? 'text-rose-500 dark:text-rose-400'
                    : 'text-slate-550 dark:text-slate-350'
                }`}
              >
                {trend.value.startsWith('+') || trend.value.startsWith('-') || trend.value.startsWith('↑') || trend.value.startsWith('↓')
                  ? trend.value.split(' ')[0]
                  : trend.value}
              </span>
            )}
          </div>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${variantStyles[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>

      {description ? (
        <div className="mt-5 flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">{description}</span>
        </div>
      ) : null}
    </CardWrapper>
  );
}
