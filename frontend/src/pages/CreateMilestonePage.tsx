import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { milestoneAPI } from '../lib/milestoneApi';
import type { CreateMilestoneInput } from '../lib/milestoneApi';
import { MilestoneForm } from '../components/MilestoneForm';
import { projectAPI } from '../lib/projectApi';

export function CreateMilestonePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectExists, setProjectExists] = useState(true);

  useEffect(() => {
    if (!projectId || !accessToken) return;

    // Verify project exists
    const checkProject = async () => {
      try {
        await projectAPI.getProject(accessToken, projectId);
      } catch {
        setProjectExists(false);
      }
    };

    checkProject();
  }, [projectId, accessToken]);

  const handleSubmit = async (data: CreateMilestoneInput) => {
    if (!projectId || !accessToken) return;

    // Only managers can create milestones
    if (user?.role !== 'manager') {
      setError('Only managers can create milestones');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const milestone = await milestoneAPI.createMilestone(accessToken, projectId, data);
      navigate(`/projects/${projectId}/milestones/${milestone.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create milestone');
    } finally {
      setIsLoading(false);
    }
  };

  if (!projectExists) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-750 dark:hover:text-violet-300 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </motion.button>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-700 dark:text-yellow-400">Project not found. Please check the URL.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <motion.button
        whileHover={{ x: -4 }}
        onClick={() => navigate(`/projects/${projectId}`)}
        className="flex items-center gap-2 text-violet-600 dark:text-violet-400 hover:text-violet-750 dark:hover:text-violet-300 font-medium mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </motion.button>

      {user?.role !== 'manager' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-450">Only managers can create milestones.</p>
        </motion.div>
      )}

      <MilestoneForm
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/projects/${projectId}`)}
        title="Create New Milestone"
        submitLabel="Create Milestone"
      />
    </motion.div>
  );
}
