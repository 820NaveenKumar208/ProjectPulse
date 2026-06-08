import { motion } from 'framer-motion';
import { ArrowLeft, Command } from 'lucide-react';
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
    </main>
  );
}
