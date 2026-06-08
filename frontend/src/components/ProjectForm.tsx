import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { type CreateProjectInput, type UpdateProjectInput } from '../lib/projectApi';

type ProjectFormProps = {
  initialData?: {
    name: string;
    description: string;
    clientId: string;
    startDate: string;
    endDate: string;
  };
  isLoading?: boolean;
  error?: string;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => void;
  onCancel?: () => void;
  title: string;
  submitLabel?: string;
};

export function ProjectForm({
  initialData,
  isLoading = false,
  error = '',
  onSubmit,
  onCancel,
  title,
  submitLabel = 'Create Project',
}: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    clientId: initialData?.clientId ?? '',
    startDate: initialData?.startDate ? initialData.startDate.split('T')[0] : '',
    endDate: initialData?.endDate ? initialData.endDate.split('T')[0] : '',
  });

  const [formError, setFormError] = useState(error);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Project name is required.');
      return;
    }

    if (!formData.clientId.trim()) {
      setFormError('Client ID is required.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setFormError('Both start and end dates are required.');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start >= end) {
      setFormError('Start date must be before end date.');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      clientId: formData.clientId.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
    });
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {onCancel && (
          <button
            className="rounded-lg p-2 transition hover:bg-slate-100"
            onClick={onCancel}
            type="button"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        )}
      </div>

      {formError && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          initial={{ opacity: 0, y: -6 }}
        >
          {formError}
        </motion.div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Project Name */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Project Name</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
            placeholder="e.g., Website Redesign"
            required
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </label>

        {/* Description */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
            placeholder="Describe the project..."
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </label>

        {/* Client ID */}
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Client ID</span>
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
            placeholder="Client identifier"
            required
            type="text"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          />
        </label>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Start Date</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
              required
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">End Date</span>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-pulse-primary focus:ring-4 focus:ring-blue-100"
              required
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </label>
        </div>

        {/* Submit Button */}
        <button
          className="group mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-pulse-text px-5 py-3 font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? 'Creating...' : submitLabel}
          {!isLoading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />}
        </button>
      </form>
    </div>
  );
}
