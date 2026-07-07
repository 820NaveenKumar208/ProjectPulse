import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProjectForm } from '../components/ProjectForm';
import { useAuth } from '../hooks/useAuth';
import { projectAPI, type CreateProjectInput, type UpdateProjectInput } from '../lib/projectApi';

export function CreateProjectPage() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(data: CreateProjectInput | UpdateProjectInput) {
    if (!accessToken) return;

    setIsLoading(true);
    setError('');

    try {
      const project = await projectAPI.createProject(accessToken, data as CreateProjectInput);
      navigate(`/projects/${project.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
        <motion.button
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-700"
          onClick={() => navigate('/projects')}
          type="button"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </motion.button>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-8"
          initial={{ opacity: 0, y: 10 }}
        >
          <ProjectForm
            error={error}
            isLoading={isLoading}
            onCancel={() => navigate('/projects')}
            onSubmit={handleSubmit}
            submitLabel="Create Project"
            title="Create New Project"
          />
        </motion.div>
    </div>
  );
}
