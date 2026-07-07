import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ApprovalWidget() {
  const pendingApprovals = [
    { id: 1, title: 'Landing Page Review', project: 'ProjectPulse Website', time: '2 hours ago' },
    { id: 2, title: 'Payment Gateway Module', project: 'SmartShop Buddy', time: '5 hours ago' },
    { id: 3, title: 'Admin Dashboard Wireframes', project: 'Retail Vision AI', time: '1 day ago' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 shadow-subtle flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white">Pending Approvals</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950/45 text-xs font-bold text-violet-750 dark:text-violet-400">
          {pendingApprovals.length}
        </span>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {pendingApprovals.map((approval, index) => (
          <motion.div
            key={approval.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
          >
            <div className="flex gap-3 items-start">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{approval.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{approval.project} • {approval.time}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:ml-auto">
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                <XCircle className="h-3.5 w-3.5 text-rose-500" />
                Review
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/20">
                <CheckCircle className="h-3.5 w-3.5" />
                Approve
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
