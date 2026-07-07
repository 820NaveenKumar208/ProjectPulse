import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Milestone, UpdateMilestoneInput } from '../lib/milestoneApi';

type MilestoneFormProps = {
  initialData?: Milestone;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  title: string;
  submitLabel?: string;
};

export function MilestoneForm({
  initialData,
  isLoading = false,
  error,
  onSubmit,
  onCancel,
  title,
  submitLabel = initialData ? 'Update Milestone' : 'Create Milestone',
}: MilestoneFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData ? initialData.dueDate.split('T')[0] : '',
    status: initialData?.status || 'not_started',
    completionPercentage: initialData?.completionPercentage || 0,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'completionPercentage' ? parseInt(value, 10) : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.dueDate) {
      errors.dueDate = 'Due date is required';
    }

    if (formData.completionPercentage < 0 || formData.completionPercentage > 100) {
      errors.completionPercentage = 'Completion percentage must be between 0 and 100';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (initialData) {
      const updateData: UpdateMilestoneInput = {};
      if (formData.title !== initialData.title) updateData.title = formData.title;
      if (formData.description !== initialData.description) updateData.description = formData.description;
      if (formData.dueDate !== initialData.dueDate.split('T')[0]) updateData.dueDate = formData.dueDate;
      if (formData.status !== initialData.status) updateData.status = formData.status as any;
      if (formData.completionPercentage !== initialData.completionPercentage) {
        updateData.completionPercentage = formData.completionPercentage;
      }
      onSubmit(updateData);
    } else {
      onSubmit({
        title: formData.title,
        description: formData.description,
        dueDate: formData.dueDate,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{title}</h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg flex gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Title <span className="text-red-650 dark:text-red-450">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="Milestone title"
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors ${
                validationErrors.title
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20 focus:border-red-600'
                  : ''
              } disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-slate-500`}
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details (optional)"
              disabled={isLoading}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-slate-500"
            />
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Due Date <span className="text-red-650 dark:text-red-450">*</span>
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors ${
                validationErrors.dueDate
                  ? 'border-red-500 bg-red-50 dark:bg-red-950/20 focus:border-red-600'
                  : ''
              } disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-slate-500`}
            />
            {validationErrors.dueDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.dueDate}</p>
            )}
          </div>

          {/* Status and Completion (only when editing) */}
          {initialData && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-slate-500"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="ready_for_approval">Ready for Approval</option>
                  <option value="approved">Approved</option>
                  <option value="changes_requested">Changes Requested</option>
                  <option value="completed">Completed</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="completionPercentage"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Progress: {formData.completionPercentage}%
                </label>
                <input
                  id="completionPercentage"
                  name="completionPercentage"
                  type="range"
                  min="0"
                  max="100"
                  value={formData.completionPercentage}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full disabled:opacity-50 accent-violet-600"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-750 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md shadow-violet-500/20"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitLabel}
            </motion.button>

            {onCancel && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-lg font-medium text-slate-700 dark:text-slate-350 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cancel
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
