import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  getPendingTasks,
  approveDraft,
  rejectDraft,
  editDraft,
  generateDraft
} from '../api/apiClient';
import { ConfirmModal } from '../components/Modal';

function formatTimestamp(value) {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function TaskCard({ task, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(task.subject || '');
  const [body, setBody] = useState(task.body || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
      setConfirmApprove(false);
      setConfirmReject(false);
    }
  };

  const handleApproveConfirm = () => {
    run(() => approveDraft(task.id));
  };

  const handleRejectConfirm = () => {
    run(() => rejectDraft(task.id));
  };

  const handleSave = () => {
    run(async () => {
      await editDraft(task.id, subject, body);
      setEditing(false);
    });
  };

  const handleCancelEdit = () => {
    setSubject(task.subject || '');
    setBody(task.body || '');
    setEditing(false);
    setError('');
  };

  const handleRegenerate = () => {
    run(() => generateDraft(task.leadId));
  };

  return (
    <div className="bg-[#14141a] border border-white/5 rounded-2xl p-5 space-y-4">
      <ConfirmModal
        isOpen={confirmApprove}
        onClose={() => setConfirmApprove(false)}
        onConfirm={handleApproveConfirm}
        title="Approve & Send Draft"
        message="Are you sure you want to approve and send this message? It will be sent immediately via the lead's original channel."
        confirmText="Approve & Send"
      />
      <ConfirmModal
        isOpen={confirmReject}
        onClose={() => setConfirmReject(false)}
        onConfirm={handleRejectConfirm}
        title="Reject Draft"
        message="Are you sure you want to reject this draft? It will be permanently discarded."
        isDestructive={true}
        confirmText="Reject"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-white font-semibold truncate">{task.leadName || 'Unknown lead'}</div>
          <div className="text-gray-500 text-sm truncate">{task.leadEmail}</div>
          <div className="text-gray-500 text-xs mt-1">{formatTimestamp(task.createdAt)}</div>
        </div>
        <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
          Awaiting Approval
        </span>
      </div>

      {/* AI Reason */}
      {task.aiReason && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <div className="text-blue-400 text-xs font-semibold mb-1">AI Reason</div>
          <p className="text-blue-300 text-xs">{task.aiReason}</p>
        </div>
      )}

      {/* Draft content */}
      {editing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            placeholder="Subject"
          />
          <textarea
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-blue-500 focus:outline-none resize-y whitespace-pre-wrap"
            placeholder="Email body"
          />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="font-bold text-white mb-2">{task.subject}</div>
          <div className="text-gray-400 text-xs whitespace-pre-wrap">{task.body}</div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleCancelEdit}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmApprove(true)}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              {busy ? 'Working...' : 'Approve & Send'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setEditing(true)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              Edit First
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleRegenerate}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              Regenerate
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmReject(true)}
              className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              Reject
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AITasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const res = await getPendingTasks();
      setTasks(res.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load pending tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
          <p className="text-gray-500 text-sm">Loading AI tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Tasks</h1>
              <p className="text-sm text-gray-500">
                {tasks.length} pending draft{tasks.length !== 1 ? 's' : ''} awaiting approval
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="bg-[#14141a] border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-gray-400">No pending AI drafts. Generate one from a lead to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onRefresh={refresh} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
