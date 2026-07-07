import { LucideIcon } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ title, description, icon: Icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 px-6 py-12 text-center shadow-subtle">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-5 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/20 transition-all hover:bg-violet-700"
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
