import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import type { Project } from '../lib/projectApi';
import { shareAPI } from '../lib/shareApi';
import { useAuth } from '../hooks/useAuth';

type ShareLinkManagerProps = {
  project: Project;
  onProjectUpdate: (updated: Project) => void;
};

export function ShareLinkManager({ project, onProjectUpdate }: ShareLinkManagerProps) {
  const { accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const shareUrl = project.shareToken
    ? `${window.location.origin}/share/${project.shareToken}`
    : null;

  const handleEnable = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError('');
    try {
      await shareAPI.enableShareLink(accessToken, project.id);
      // Refetch to get updated project
      const { projectAPI } = await import('../lib/projectApi');
      const updated = await projectAPI.getProject(accessToken, project.id);
      onProjectUpdate(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to enable share link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotate = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError('');
    try {
      await shareAPI.rotateShareLink(accessToken, project.id);
      const { projectAPI } = await import('../lib/projectApi');
      const updated = await projectAPI.getProject(accessToken, project.id);
      onProjectUpdate(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to rotate share link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    setError('');
    try {
      await shareAPI.disableShareLink(accessToken, project.id);
      const { projectAPI } = await import('../lib/projectApi');
      const updated = await projectAPI.getProject(accessToken, project.id);
      onProjectUpdate(updated);
      setShowDisableConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to disable share link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired =
    project.shareExpiresAt && new Date(project.shareExpiresAt) < new Date();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-pulse-primary" />
        <h3 className="text-base font-semibold text-slate-900">Public Share Link</h3>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Share a read-only view of this project with external stakeholders — no login required.
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {!project.shareEnabled || !project.shareToken ? (
        /* Disabled state */
        <div className="mt-4">
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3">
            <Link2 className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">No active share link</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEnable}
            disabled={isLoading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-pulse-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Link2 className="h-4 w-4" />
            {isLoading ? 'Generating...' : 'Enable Share Link'}
          </motion.button>
        </div>
      ) : (
        /* Enabled state */
        <div className="mt-4 space-y-3">
          {isExpired && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              This link has expired.
            </div>
          )}

          {/* URL display */}
          <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Link2 className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="flex-1 truncate text-sm text-slate-600">{shareUrl}</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
              title="Copy link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </motion.button>
          </div>

          {project.shareExpiresAt && !isExpired && (
            <p className="text-xs text-slate-400">
              Expires {new Date(project.shareExpiresAt).toLocaleDateString()}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRotate}
              disabled={isLoading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </motion.button>

            {!showDisableConfirm ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDisableConfirm(true)}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Disable
              </motion.button>
            ) : (
              <div className="flex flex-1 items-center gap-1">
                <button
                  onClick={handleDisable}
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDisableConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
