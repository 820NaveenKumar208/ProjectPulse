import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { projectProgress } from './dashboardData';

export function ProjectProgressChart() {
  return (
    <div className="h-[310px] w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart
          data={projectProgress}
          layout="vertical"
          margin={{ bottom: 0, left: 12, right: 18, top: 8 }}
        >
          <CartesianGrid horizontal={false} stroke="#E2E8F0" strokeDasharray="4 4" />
          <XAxis
            axisLine={false}
            domain={[0, 100]}
            tick={{ fill: '#94A3B8', fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
            tickLine={false}
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="name"
            tick={{ fill: '#475569', fontSize: 12 }}
            tickLine={false}
            type="category"
            width={112}
          />
          <Tooltip
            contentStyle={{
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
              fontSize: '12px',
            }}
            cursor={{ fill: '#F8FAFC' }}
            formatter={(value) => [`${value}%`, 'Progress']}
          />
          <Bar dataKey="progress" fill="#2563EB" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
