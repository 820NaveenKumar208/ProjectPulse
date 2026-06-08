import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { milestoneAPI } from '../lib/milestoneApi';
import type { Milestone, UpdateMilestoneInput } from '../lib/milestoneApi';
import { MilestoneForm } from '../components/MilestoneForm';
import { MilestoneCard } from '../components/MilestoneCard';

export function MilestoneDetailPage() {
  const { projectId, milestoneId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [searchParams] = useSearchParams();
  const isEditing = searchParams.get('edit') === 'true';

  const [milestone, setMilestone] = useState<Milestone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!projectId || !milestoneId || !accessToken) return;

    const fetchMilestone = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await milestoneAPI.getMilestone(accessToken, milestoneId);
        setMilestone(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load milestone');
        if (err.message?.includes('401') || err.message?.includes('403')) {
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMilestone();
  }, [milestoneId, projectId, accessToken, navigate]);

  const handleUpdate = async (data: UpdateMilestoneInput) => {
    if (!accessToken || !milestoneId) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const updated = await milestoneAPI.updateMilestone(accessToken, milestoneId, data);
      setMilestone(updated);
      navigate(`/projects/${projectId}/milestones/${milestoneId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !milestoneId) return;

    try {
      setIsSubmitting(true);
      await milestoneAPI.deleteMilestone(accessToken, milestoneId);
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to delete milestone');
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!accessToken || !milestoneId) return;

    try {
      setIsSubmitting(true);
      const updated = await milestoneAPI.completeMilestone(accessToken, milestoneId);
      setMilestone(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to mark milestone complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isManager = user?.role === 'manager';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!milestone) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-600">{error || 'Milestone not found'}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={() => navigate(`/projects/${projectId}`)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Project
        </motion.button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{milestone.title}</h1>
            <p className="mt-2 text-gray-600 text-lg">{milestone.description}</p>
          </div>

          {isManager && !isEditing && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`?edit=true`)}
                className="px-4 py-2 rounded-lg font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Edit
              </motion.button>
              {milestone.status !== 'completed' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg font-medium text-green-600 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  Mark Complete
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-lg font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                Delete
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Edit Form or Display */}
      {isEditing && isManager ? (
        <MilestoneForm
          initialData={milestone}
          isLoading={isSubmitting}
          error={error}
          onSubmit={handleUpdate}
          onCancel={() => navigate(`?edit=false`)}
          title="Edit Milestone"
        />
      ) : (
        <div className="grid gap-8">
          <MilestoneCard milestone={milestone} isManager={isManager} />

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <p className="text-lg text-gray-900 font-semibold">{milestone.status.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Progress</p>
                <p className="text-lg text-gray-900 font-semibold">{milestone.completionPercentage}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Created</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {new Date(milestone.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
                <p className="text-lg text-gray-900 font-semibold">
                  {new Date(milestone.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-sm"
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Milestone?</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{milestone.title}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
