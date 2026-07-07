type HealthScoreWidgetProps = {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

export function HealthScoreWidget({ score }: HealthScoreWidgetProps) {
  let textClass = 'text-emerald-500 dark:text-emerald-400';
  let dotColor = '🟢';
  let label = 'Excellent';

  if (score < 40) {
    textClass = 'text-rose-500 dark:text-rose-400';
    dotColor = '🔴';
    label = 'Critical';
  } else if (score < 60) {
    textClass = 'text-amber-500 dark:text-amber-400';
    dotColor = '🟠';
    label = 'At Risk';
  } else if (score < 80) {
    textClass = 'text-emerald-500 dark:text-emerald-400';
    dotColor = '🟢';
    label = 'Good';
  }

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md p-4 shadow-subtle max-w-[220px]">
      {/* Circular Gauge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800/50 fill-none"
            strokeWidth="4"
          />
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            className="stroke-current fill-none transition-all duration-1000 ease-out"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              stroke: 'url(#widgetHealthGradient)',
            }}
          />
          <defs>
            <linearGradient id="widgetHealthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              {score < 40 ? (
                <>
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </>
              ) : score < 60 ? (
                <>
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </>
              ) : score < 80 ? (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0d9488" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0d9488" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute font-extrabold tracking-tight text-slate-800 dark:text-slate-100 text-xs">
          {score}
        </span>
      </div>

      {/* Label and Info */}
      <div className="min-w-0">
        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">
          Health Score
        </h4>
        <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1 leading-none">
          {score}/100
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-xs leading-none">{dotColor}</span>
          <span className={`text-xs font-extrabold ${textClass} leading-none`}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
