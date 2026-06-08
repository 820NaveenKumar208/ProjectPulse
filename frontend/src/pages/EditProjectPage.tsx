import { motion } from 'framer-motion';
import { ArrowLeft, Command } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ProjectForm } from '../components/ProjectForm';
import { useAuth } from '../hooks/useAuth';
import { projectAPI, type Project, type UpdateProjectInput } from '../lib/projectApi';

export function EditProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { accessToken } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!accessToken || !projectId) return;

    setIsLoading(true);
    setError('');

    projectAPI
      .getProject(accessToken, projectId)
      .then(setProject)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      })
      .finally(() => setIsLoading(false));
  }, [accessToken, projectId]);

  async function handleSubmit(data: UpdateProjectInput) {
    if (!accessToken || !projectId) return;

    setIsSubmitting(true);
    setError('');

    try {
      const updated = await projectAPI.updateProject(accessToken, projectId, data);
      setProject(updated);
      navigate(`/projects/${projectId}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-pulse-background text-pulse-text">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <a className="flex items-center gap-2 font-semibold" href="/app">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pulse-text text-white">
              <Command className="h-4 w-4" />
            </span>
            <span>ProjectPulse</span>
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.button
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={() => navigate(-1)}
          type="button"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </motion.button>

        {/* Loading State */}
        {isLoading && (
          <div className="flex min-h-96 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-pulse-primary" />
          </div>
        )}

        {/* Content */}
        {project && !isLoading && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white p-8"
            initial={{ opacity: 0, y: 10 }}
          >
            <ProjectForm
              error={error}
              initialData={{
                name: project.name,
                description: project.description,
                clientId: project.clientId,
                startDate: project.startDate,
                endDate: project.endDate,
              }}
              isLoading={isSubmitting}
              onCancel={() => navigate(`/projects/${projectId}`)}
              onSubmit={handleSubmit}
              submitLabel="Update Project"
              title="Edit Project"
            />
          </motion.div>
        )}
      </div>
    </main>
  );
}
