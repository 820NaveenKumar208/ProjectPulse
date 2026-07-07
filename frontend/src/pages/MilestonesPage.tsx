import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { projectAPI, type Project } from '../lib/projectApi';
import { milestoneAPI, type Milestone } from '../lib/milestoneApi';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { KPICard } from '../components/KPICard';
import {
  Milestone as MilestoneIcon,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  FolderKanban,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ProjectWithMilestones = {
  project: Project;
  milestones: Milestone[];
};

export function MilestonesPage() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectWithMilestones[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch projects
        const projectsRes = await projectAPI.listProjects(accessToken, { limit: 50 });
        const activeProjects = projectsRes.projects.filter(p => p.status === 'active' || p.status === 'planning');

        // Fetch milestones for each project
        const mappedData = await Promise.all(
          activeProjects.map(async (project) => {
            try {
              const msRes = await milestoneAPI.listMilestones(accessToken, project.id);
              return { project, milestones: msRes.milestones };
            } catch (err) {
              console.error(`Failed to fetch milestones for project ${project.id}`, err);
              return { project, milestones: [] };
            }
          })
        );

        setData(mappedData);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch milestones data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded bg-slate-200 animate-pulse" />
        <LoadingState type="list" rows={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <MilestoneIcon className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-4 text-sm font-semibold text-red-800">Error Loading Milestones</h3>
        <p className="mt-2 text-xs text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-red-700"
          type="button"
        >
          Retry
        </button>
      </div>
    );
  }

  // Aggregate stats
  const allMilestones = data.flatMap((d) => d.milestones);
  const total = allMilestones.length;
  const completed = allMilestones.filter((m) => m.status === 'approved' || m.status === 'completed').length;
  const pendingApproval = allMilestones.filter((m) => m.status === 'ready_for_approval').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" aria-label="Milestone management greeting">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">Timeline & Delivery</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Milestones Tracker
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Monitor, update, and request client verification across active workspace milestones.
          </p>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-3" aria-label="KPIs">
        <KPICard
          label="Total Milestones"
          value={total}
          icon={MilestoneIcon}
          description="Across all active projects"
          index={0}
        />
        <KPICard
          label="Completed"
          value={completed}
          icon={CheckCircle2}
          description={`${total - completed} remaining`}
          index={1}
        />
        <KPICard
          label="Pending Client Review"
          value={pendingApproval}
          icon={Clock}
          description="Awaiting sign-off"
          index={2}
        />
      </section>

      {/* Grouped lists */}
      <div className="space-y-6">
        {data.length === 0 ? (
          <EmptyState
            title="No active projects"
            description="Create a project to define milestones and project delivery paths."
            icon={FolderKanban}
            action={{
              label: 'Create Project',
              onClick: () => navigate('/projects/new'),
            }}
          />
        ) : (
          data.map(({ project, milestones }) => (
            <section
              key={project.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
            >
              {/* Project header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{project.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Completion progress: {project.progress}%
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/projects/${project.id}/milestones/new`)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition"
                  type="button"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Milestone
                </button>
              </div>

              {/* Milestones list */}
              <div className="mt-6 space-y-3">
                {milestones.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No milestones defined for this project.
                  </div>
                ) : (
                  milestones
                    .sort((a, b) => a.order - b.order)
                    .map((milestone) => (
                      <div
                        key={milestone.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm text-slate-800 truncate">
                            {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-6">
                          {/* Due Date */}
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs shrink-0">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{new Date(milestone.dueDate).toLocaleDateString()}</span>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide border shrink-0 ${
                              milestone.status === 'approved' || milestone.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : milestone.status === 'ready_for_approval'
                                ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                                : milestone.status === 'changes_requested'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : 'bg-slate-50 text-slate-600 border-slate-100'
                            }`}
                          >
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
