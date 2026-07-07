import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
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
    <div className="space-y-6 max-w-2xl mx-auto">
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
  );
}
