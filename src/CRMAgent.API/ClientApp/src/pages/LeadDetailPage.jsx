import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getLeadById, updateLeadStage, getInteractions, 
  getLogsByLead, getDrafts, generateDraft, 
  approveDraft, rejectDraft, editDraft 
} from '../api/apiClient';
import { 
  ArrowLeft, Mail, MessageCircle, AlertCircle, 
  Clock, Save, RefreshCw, Send,
  Building2, Activity, Webhook
} from 'lucide-react';
import { ScoreBadge, EmotionBadge } from '../components/Badges';
import { ConfirmModal, AlertModal } from '../components/Modal';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [lead, setLead] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [draft, setDraft] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [draftLoading, setDraftLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Editable draft state
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', message: '', variant: 'info' });
  const [confirmStageChange, setConfirmStageChange] = useState(null);
  const [confirmRejectDraft, setConfirmRejectDraft] = useState(false);

  const fetchLeadData = useCallback(async () => {
    try {
      setLoading(true);
      const [leadRes, interactionsRes, logsRes, draftsRes] = await Promise.all([
        getLeadById(id),
        getInteractions(id),
        getLogsByLead(id),
        getDrafts(id)
      ]);
      
      setLead(leadRes.data);
      
      // Merge interactions and logs for the timeline, sort by date desc
      const merged = [
        ...interactionsRes.data.map(i => ({ ...i, timelineType: 'interaction' })),
        ...logsRes.data.map(l => ({ ...l, timelineType: 'log' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setTimeline(merged);
      
      // Find pending draft if exists
      const pendingDraft = draftsRes.data.find(d => d.status === 'PendingApproval');
      if (pendingDraft) {
        setDraft(pendingDraft);
        setSubject(pendingDraft.subject);
        setBody(pendingDraft.body);
      } else {
        setDraft(null);
      }
    } catch (err) {
      setError('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  const handleStageChangeSelect = (e) => {
    const newStage = e.target.value;
    if (newStage === lead.pipelineStage) return;
    setConfirmStageChange(newStage);
  };

  const handleStageChangeConfirm = async () => {
    if (!confirmStageChange) return;
    try {
      await updateLeadStage(id, confirmStageChange);
      // Re-fetch to get new logs and potential auto-generated draft
      await fetchLeadData();
    } catch (err) {
      setAlertState({ isOpen: true, title: 'Error', message: 'Failed to update stage', variant: 'error' });
    } finally {
      setConfirmStageChange(null);
    }
  };

  const handleRegenerateDraft = async () => {
    try {
      setDraftLoading(true);
      await generateDraft(id);
      await fetchLeadData();
    } catch (err) {
      setAlertState({ isOpen: true, title: 'Error', message: 'Failed to generate draft', variant: 'error' });
    } finally {
      setDraftLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    try {
      setIsSaving(true);
      await editDraft(draft.id, subject, body);
      // Show some temporary success state if desired
    } catch (err) {
      setAlertState({ isOpen: true, title: 'Error', message: 'Failed to save draft', variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveDraft = async () => {
    if (!draft) return;
    try {
      setDraftLoading(true);
      // Save any edits first
      if (subject !== draft.subject || body !== draft.body) {
        await editDraft(draft.id, subject, body);
      }
      await approveDraft(draft.id);
      await fetchLeadData();
    } catch (err) {
      setAlertState({ isOpen: true, title: 'Error', message: err.response?.data?.message || 'Failed to approve draft', variant: 'error' });
    } finally {
      setDraftLoading(false);
    }
  };

  const handleRejectDraftConfirm = async () => {
    if (!draft) return;
    try {
      setDraftLoading(true);
      await rejectDraft(draft.id);
      await fetchLeadData();
    } catch (err) {
      setAlertState({ isOpen: true, title: 'Error', message: 'Failed to reject draft', variant: 'error' });
    } finally {
      setDraftLoading(false);
      setConfirmRejectDraft(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error || !lead) return <div className="p-8 text-red-400">{error || 'Lead not found'}</div>;

  const stages = ['New', 'Contacted', 'Qualified', 'ProposalSent', 'Negotiation', 'Won', 'Lost'];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#0a0a0f] min-h-screen relative">
      <AlertModal 
        isOpen={alertState.isOpen} 
        onClose={() => setAlertState({ ...alertState, isOpen: false })} 
        title={alertState.title} 
        message={alertState.message} 
        variant={alertState.variant} 
      />
      <ConfirmModal
        isOpen={!!confirmStageChange}
        onClose={() => setConfirmStageChange(null)}
        onConfirm={handleStageChangeConfirm}
        title="Change Pipeline Stage"
        message={`Are you sure you want to move this lead to the ${confirmStageChange} stage? Depending on the stage, this may trigger automated actions like generating an AI draft.`}
        confirmText="Change Stage"
      />
      <ConfirmModal
        isOpen={confirmRejectDraft}
        onClose={() => setConfirmRejectDraft(false)}
        onConfirm={handleRejectDraftConfirm}
        title="Reject AI Draft"
        message="Are you sure you want to reject and discard this AI-generated draft?"
        isDestructive={true}
        confirmText="Reject Draft"
      />

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/leads')}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{lead.fullName}</h1>
          <p className="text-gray-400 mt-1">Lead Details & AI Copilot</p>
        </div>
      </div>

      {/* Main Grid: 30 / 70 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANE: 30% */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="bg-[#14141a] border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {lead.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">{lead.fullName}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Building2 size={14} />
                  {lead.company}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Mail size={16} className="text-gray-500" />
                <a href={`mailto:${lead.email}`} className="hover:text-indigo-400 transition">{lead.email}</a>
              </div>
              {lead.telegramUsername && (
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <MessageCircle size={16} className="text-blue-500" />
                  <a href={`https://t.me/${lead.telegramUsername}`} target="_blank" rel="noreferrer" className="hover:text-blue-400 transition">
                    @{lead.telegramUsername}
                  </a>
                </div>
              )}
            </div>

            {/* Original Context */}
            <div className="mt-6 pt-6 border-t border-white/5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Original Context</h3>
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-sm text-gray-300 italic whitespace-pre-wrap">"{lead.rawInquiryText}"</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex gap-2 flex-wrap">
              <ScoreBadge score={lead.aiScore} />
              <EmotionBadge emotion={lead.emotion} />
            </div>
            
            {(lead.isAtRisk || lead.isStagnant) && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {lead.isAtRisk && (
                  <span className="text-xs px-2 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/20 flex items-center gap-1">
                    <AlertCircle size={12} /> At Risk
                  </span>
                )}
                {lead.isStagnant && (
                  <span className="text-xs px-2 py-1 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/20 flex items-center gap-1">
                    <Clock size={12} /> Stagnant
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stage Controls */}
          <div className="bg-[#14141a] border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Pipeline Stage</h3>
            <select 
              value={lead.pipelineStage} 
              onChange={handleStageChangeSelect}
              className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
            >
              {stages.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Changing stage to <strong>Contacted</strong> or <strong>Qualified</strong> triggers AI Draft Generation.
            </p>
          </div>
        </div>

        {/* RIGHT PANE: 70% */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* AI Draft Panel */}
          <div className="bg-[#14141a] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
            <div className="bg-[#1a1a24] px-6 py-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Mail size={16} />
                </div>
                <h3 className="font-semibold text-white">AI Copilot Draft</h3>
              </div>
              <button 
                onClick={handleRegenerateDraft}
                disabled={draftLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={draftLoading ? "animate-spin" : ""} />
                Regenerate
              </button>
            </div>

            <div className="p-6">
              {draft ? (
                <div className="space-y-4">
                  {/* AI Reason Card */}
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200">
                    <strong className="block mb-1 text-indigo-300">AI Reasoning:</strong>
                    {draft.aiReason}
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Subject</label>
                    <input 
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Body Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Body</label>
                    <textarea 
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={8}
                      className="w-full bg-[#1a1a24] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setConfirmRejectDraft(true)}
                      disabled={draftLoading}
                      className="px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition disabled:opacity-50"
                    >
                      Reject Draft
                    </button>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleSaveDraft}
                        disabled={isSaving || draftLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
                      >
                        <Save size={14} />
                        {isSaving ? 'Saving...' : 'Save Edits'}
                      </button>
                      <button 
                        onClick={handleApproveDraft}
                        disabled={draftLoading}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                      >
                        <Send size={14} />
                        Approve & Send
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-white/5 text-gray-500 flex items-center justify-center mx-auto mb-4">
                    <Mail size={20} />
                  </div>
                  <h4 className="text-gray-300 font-medium mb-1">No pending draft</h4>
                  <p className="text-sm text-gray-500 mb-4">Change stage to Contacted/Qualified or manually generate one.</p>
                  <button 
                    onClick={handleRegenerateDraft}
                    disabled={draftLoading}
                    className="px-4 py-2 text-sm text-white bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 rounded-lg transition"
                  >
                    Generate Draft Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Feed */}
          <div className="bg-[#14141a] border border-white/5 rounded-2xl flex-1 flex flex-col min-h-[400px]">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="font-semibold text-white">Activity Timeline</h3>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {timeline.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No activity recorded yet.</div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
                  {timeline.map((item, i) => {
                    const isLog = item.timelineType === 'log';
                    const isWebHook = isLog && item.triggeredBy === 'SocialWebhook';
                    const isEmail = !isLog && item.channel === 'Email';
                    const isTelegram = !isLog && item.channel === 'Telegram';
                    
                    let Icon = Activity;
                    let iconColor = 'text-gray-400 bg-gray-500/20';
                    
                    if (isWebHook) { Icon = Webhook; iconColor = 'text-purple-400 bg-purple-500/20'; }
                    else if (isEmail) { Icon = Mail; iconColor = 'text-emerald-400 bg-emerald-500/20'; }
                    else if (isTelegram) { Icon = MessageCircle; iconColor = 'text-blue-400 bg-blue-500/20'; }
                    else if (isLog && item.action === 'Stage Updated') { Icon = RefreshCw; iconColor = 'text-orange-400 bg-orange-500/20'; }

                    return (
                      <div key={`${item.timelineType}-${item.id}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        
                        {/* Icon Marker */}
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border border-white/10 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 ${iconColor}`}>
                          <Icon size={14} />
                        </div>
                        
                        {/* Content Card */}
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-12 md:ml-0 bg-[#1a1a24] border border-white/5 rounded-xl p-4 hover:border-white/10 transition">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-white">
                              {isLog ? item.action : `${item.direction} ${item.channel}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 whitespace-pre-wrap">
                            {isLog ? item.reason : item.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
