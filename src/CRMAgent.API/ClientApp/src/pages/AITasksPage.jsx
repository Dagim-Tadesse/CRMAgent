import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flag } from 'lucide-react';
import {
  getPendingTasks,
  approveDraft,
  rejectDraft,
  editDraft,
  generateDraft,
  escalateDraft,
  reviewDraftEscalation
} from '../api/apiClient';
import { ConfirmModal } from '../components/Modal';
import { Loader } from '../components/Loader';
import { useAuth } from '../hooks/useAuth';

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
  const { role } = useAuth();
  const isManager = role === 'Admin' || role === 'Manager';
  const isSalesRep = role === 'Admin' || role === 'SalesRep';

  const [editing, setEditing] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(''); // 'Approved' or 'Rejected'

  const [subject, setSubject] = useState(task.subject || '');
  const [body, setBody] = useState(task.body || '');
  const [escalationNote, setEscalationNote] = useState(task.escalationNote || '');
  const [managerFeedback, setManagerFeedback] = useState(task.managerFeedback || '');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  const run = async (fn, { refreshOnSuccess = true } = {}) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      if (refreshOnSuccess) await onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
      setConfirmApprove(false);
      setConfirmReject(false);
    }
  };

  const handleApproveConfirm = () => run(() => approveDraft(task.id));
  const handleRejectConfirm = () => run(() => rejectDraft(task.id));

  const handleSave = () => {
    run(async () => {
      await editDraft(task.id, subject, body);
      setEditing(false);
    });
  };

  const handleRegenerate = () => {
    run(() => generateDraft(task.leadId), { refreshOnSuccess: true });
  };

  const handleEscalateSubmit = () => {
    run(async () => {
      await escalateDraft(task.id, escalationNote, body);
      setEscalating(false);
    });
  };

  const handleReviewSubmit = () => {
    if (reviewStatus === 'Rejected' && !managerFeedback.trim()) {
      setError("A feedback message is required when rejecting a draft.");
      return;
    }
    run(async () => {
      await reviewDraftEscalation(task.id, reviewStatus, managerFeedback, body);
      setReviewing(false);
    });
  };

  const handleCancelEdit = () => {
    setSubject(task.subject || '');
    setBody(task.body || '');
    setEditing(false);
    setError('');
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
        title="Discard Draft"
        message="Are you sure you want to discard this draft? It will be permanently discarded."
        isDestructive={true}
        confirmText="Discard"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-white font-semibold truncate">{task?.leadName || 'Unknown lead'}</div>
          <div className="text-gray-500 text-sm truncate">{task?.leadEmail || '—'}</div>
          <div className="text-gray-500 text-xs mt-1 flex flex-wrap items-center gap-2">
            <span>{formatTimestamp(task?.createdAt)}</span>
            {task?.pipelineStage && (
              <span className="bg-white/5 border border-white/10 text-gray-400 px-2 py-0.5 rounded-full">
                {task.pipelineStage}
              </span>
            )}
          </div>
        </div>
        
        {/* Badges */}
        <div className="flex items-center gap-2">
          {task.escalationStatus === 'Requested' && (
            <span className="bg-orange-500/20 text-orange-300 border border-orange-500/20 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
              Manager Approval Requested
            </span>
          )}
          {task.escalationStatus === 'Approved' && (
            <span className="bg-green-500/20 text-green-300 border border-green-500/20 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
              Manager Approved
            </span>
          )}
          {task.escalationStatus === 'Rejected' && (
            <span className="bg-red-500/20 text-red-300 border border-red-500/20 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
              Manager Rejected
            </span>
          )}
          {task.escalationStatus === 'None' && (
            <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/20 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
              Awaiting Approval
            </span>
          )}
        </div>
      </div>

      {/* Trigger & AI Info */}
      {task?.triggerMessage && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3">
          <div className="text-gray-400 text-xs font-semibold mb-1">Inbound message</div>
          <p className="text-gray-300 text-xs whitespace-pre-wrap">{task.triggerMessage}</p>
        </div>
      )}

      {task?.aiReason && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
          <div className="text-blue-400 text-xs font-semibold mb-1">AI Reason</div>
          <p className="text-blue-300 text-xs">{task.aiReason}</p>
        </div>
      )}

      {/* Escalation & Manager Feedback Notes */}
      {(task.escalationNote || task.managerFeedback) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {task.escalationNote && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3">
              <div className="text-orange-400 text-xs font-semibold mb-1">Sales Rep Note to Manager</div>
              <p className="text-orange-300 text-xs whitespace-pre-wrap">{task.escalationNote}</p>
            </div>
          )}
          {task.managerFeedback && (
            <div className={`bg-${task.escalationStatus === 'Rejected' ? 'red' : 'green'}-500/10 border border-${task.escalationStatus === 'Rejected' ? 'red' : 'green'}-500/20 rounded-xl p-3`}>
              <div className={`text-${task.escalationStatus === 'Rejected' ? 'red' : 'green'}-400 text-xs font-semibold mb-1`}>
                Manager Feedback
              </div>
              <p className={`text-${task.escalationStatus === 'Rejected' ? 'red' : 'green'}-300 text-xs whitespace-pre-wrap`}>
                {task.managerFeedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Draft content input fields */}
      {(editing || escalating || reviewing) ? (
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
          
          {escalating && (
            <textarea
              rows={3}
              value={escalationNote}
              onChange={(e) => setEscalationNote(e.target.value)}
              className="w-full bg-orange-500/10 border border-orange-500/30 rounded-xl px-3 py-2 text-orange-100 placeholder-orange-300/50 focus:border-orange-500 focus:outline-none resize-y"
              placeholder="Note to manager (e.g., Please approve this 10% discount...)"
            />
          )}

          {reviewing && (
            <textarea
              rows={3}
              value={managerFeedback}
              onChange={(e) => setManagerFeedback(e.target.value)}
              className="w-full bg-purple-500/10 border border-purple-500/30 rounded-xl px-3 py-2 text-purple-100 placeholder-purple-300/50 focus:border-purple-500 focus:outline-none resize-y"
              placeholder={reviewStatus === 'Rejected' ? "Reason for rejection (Required)" : "Optional feedback..."}
            />
          )}
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-xs font-semibold mb-1">Generated reply</div>
          <div className="font-bold text-white mb-2">{task?.subject || '(No subject)'}</div>
          <div className="text-gray-400 text-xs whitespace-pre-wrap">{task?.body || ''}</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {editing ? (
          <>
            <button
              type="button" disabled={busy} onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button" disabled={busy} onClick={handleCancelEdit}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : escalating ? (
          <>
            <button
              type="button" disabled={busy} onClick={handleEscalateSubmit}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              {busy ? 'Submitting...' : 'Submit for Manager Approval'}
            </button>
            <button
              type="button" disabled={busy} onClick={() => setEscalating(false)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : reviewing ? (
          <>
            <button
              type="button" disabled={busy} onClick={handleReviewSubmit}
              className={`${reviewStatus === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50`}
            >
              {busy ? 'Submitting...' : `Confirm ${reviewStatus}`}
            </button>
            <button
              type="button" disabled={busy} onClick={() => setReviewing(false)}
              className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* MANAGER VIEW (Escalated Drafts) */}
            {isManager && task.escalationStatus === 'Requested' ? (
              <>
                <button
                  type="button" disabled={busy} onClick={() => { setReviewStatus('Approved'); setReviewing(true); }}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button" disabled={busy} onClick={() => setEditing(true)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  Edit
                </button>
                <button
                  type="button" disabled={busy} onClick={() => { setReviewStatus('Rejected'); setReviewing(true); }}
                  className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            ) : isSalesRep ? (
              /* SALES REP VIEW (or Admin acting as Sales Rep on unescalated drafts) */
              <>
                <button
                  type="button" disabled={busy} onClick={() => setConfirmApprove(true)}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  {busy ? 'Working...' : 'Approve & Send'}
                </button>
                <button
                  type="button" disabled={busy} onClick={() => setEditing(true)}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  Edit First
                </button>
                <button
                  type="button" disabled={busy} onClick={handleRegenerate}
                  className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  Regenerate
                </button>
                <button
                  type="button" disabled={busy} onClick={() => setConfirmReject(true)}
                  className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
                >
                  Discard
                </button>
                {task.escalationStatus !== 'Requested' && (
                  <button
                    type="button" disabled={busy} onClick={() => { setEscalating(true); setEditing(true); }}
                    className="flex items-center gap-1.5 ml-auto border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 rounded-xl px-3 py-2 text-sm font-medium transition disabled:opacity-50"
                    title="Flag for Manager Approval"
                  >
                    <Flag size={16} />
                    <span>Manager Approval</span>
                  </button>
                )}
              </>
            ) : (
              <div className="text-xs text-yellow-400/80 italic">
                Overseer View: Managers can review task details, but cannot edit, approve, or reject unescalated AI replies.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function AITasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async ({ silent } = {}) => {
    if (!silent) {
      // keep full-screen loader only on first load
    } else {
      setRefreshing(true);
    }
    try {
      const res = await getPendingTasks();
      // Filter out invalid tasks, then sort so 'Requested' tasks are at the top
      let list = Array.isArray(res?.data) ? res.data.filter((t) => t && t.id != null) : [];
      list.sort((a, b) => {
        if (a.escalationStatus === 'Requested' && b.escalationStatus !== 'Requested') return -1;
        if (b.escalationStatus === 'Requested' && a.escalationStatus !== 'Requested') return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setTasks(list);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load pending tasks');
      if (!silent) setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    // Poll so inbound-triggered drafts appear without a full remount
    const intervalId = setInterval(() => refresh({ silent: true }), 12000);
    const onFocus = () => refresh({ silent: true });
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  if (loading) {
    return <Loader fullScreen={true} message="Loading AI tasks..." />;
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
          <button
            type="button"
            disabled={refreshing}
            onClick={() => refresh({ silent: true })}
            className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="bg-[#14141a] border border-white/5 rounded-2xl p-12 text-center">
            <p className="text-gray-400">No pending AI drafts. New inbound messages will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onRefresh={() => refresh({ silent: true })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
