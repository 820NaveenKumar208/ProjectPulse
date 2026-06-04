import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { completionTrend } from './dashboardData';

export function CompletionTrendChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={completionTrend} margin={{ bottom: 0, left: -24, right: 10, top: 8 }}>
          <defs>
            <linearGradient id="completionFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="month"
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
              fontSize: '12px',
            }}
          />
          <Area
            dataKey="planned"
            fill="transparent"
            stroke="#CBD5E1"
            strokeDasharray="5 5"
            strokeWidth={2}
            type="monotone"
          />
          <Area
            dataKey="completed"
            fill="url(#completionFill)"
            stroke="#2563EB"
            strokeWidth={2.5}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
