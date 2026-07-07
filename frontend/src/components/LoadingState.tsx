type LoadingStateProps = {
  rows?: number;
  type?: 'list' | 'cards' | 'spinner';
};

export function LoadingState({ rows = 3, type = 'list' }: LoadingStateProps) {
  if (type === 'spinner') {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-violet-600 dark:border-t-violet-400" />
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="mt-4 h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900/50 p-4 shadow-sm animate-pulse"
        >
          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-6 w-16 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      ))}
    </div>
  );
}
