export function MiniHealthGauge({ score }: { score: number }) {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  let strokeColor = 'stroke-emerald-500';
  if (score < 40) strokeColor = 'stroke-rose-500';
  else if (score < 60) strokeColor = 'stroke-amber-500';
  else if (score < 80) strokeColor = 'stroke-emerald-500';

  return (
    <div className="relative flex items-center justify-center h-9 w-9 shrink-0" title={`Health Score: ${score}/100`}>
      <svg className="w-9 h-9 -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-800/80 fill-none"
          strokeWidth="2.5"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          className={`fill-none transition-all duration-1000 ease-out ${strokeColor}`}
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-extrabold text-slate-800 dark:text-slate-200">
        {score}
      </span>
    </div>
  );
}
