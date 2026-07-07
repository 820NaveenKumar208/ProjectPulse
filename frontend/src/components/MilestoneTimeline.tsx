import { motion } from 'framer-motion';
import type { Milestone } from '../lib/milestoneApi';
import { MilestoneCard } from './MilestoneCard';

type MilestoneTimelineProps = {
  milestones: Milestone[];
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestone: Milestone) => void;
  onComplete?: (milestone: Milestone) => void;
  isManager?: boolean;
};

export function MilestoneTimeline({
  milestones,
  onEdit,
  onDelete,
  onComplete,
  isManager = false,
}: MilestoneTimelineProps) {
  if (milestones.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 dark:text-slate-400">No milestones yet. Create one to get started!</p>
      </div>
    );
  }

  // Sort by order
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Timeline visualization */}
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 to-emerald-500 rounded-full" />

        {/* Milestone items */}
        <div className="space-y-6">
          {sortedMilestones.map((milestone, _index) => {
            return (
              <motion.div key={milestone.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {/* Timeline dot */}
                <div className="absolute -left-4.5 top-2 w-5 h-5 rounded-full border-4 border-white dark:border-[#0B1120] bg-violet-500 shadow-md" />

                {/* Milestone card */}
                <MilestoneCard
                  milestone={milestone}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onComplete={onComplete}
                  isManager={isManager}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800"
      >
        <div className="text-center">
          <div className="text-xl font-bold text-slate-650 dark:text-slate-400">
            {sortedMilestones.filter((m) => m.status === 'not_started').length}
          </div>
          <div className="text-xs text-slate-550 dark:text-slate-400">Not Started</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-violet-600 dark:text-violet-400">
            {sortedMilestones.filter((m) => m.status === 'in_progress').length}
          </div>
          <div className="text-xs text-slate-550 dark:text-slate-400">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-fuchsia-600 dark:text-fuchsia-400">
            {sortedMilestones.filter((m) => m.status === 'ready_for_approval').length}
          </div>
          <div className="text-xs text-slate-550 dark:text-slate-400">For Review</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {sortedMilestones.filter((m) => m.status === 'completed').length}
          </div>
          <div className="text-xs text-slate-550 dark:text-slate-400">Completed</div>
        </div>
      </motion.div>
    </div>
  );
}
