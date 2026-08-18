import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable
} from '@dnd-kit/core';
import { ArrowLeft } from 'lucide-react';
import { getLeads, updateLeadStage } from '../api/apiClient';
import LeadCard, { STAGE_COLORS } from '../components/LeadCard';
import { ScoreBadge } from '../components/Badges';
import { ConfirmModal } from '../components/Modal';

const STAGES = [
  'New',
  'Contacted',
  'Qualified',
  'ProposalSent',
  'Negotiation',
  'Won',
  'Lost'
];

function DroppableColumn({ stage, leads, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const color = STAGE_COLORS[stage] || '#6b7280';

  return (
    <div className="w-72 flex-shrink-0 flex flex-col">
      <div className="bg-[#14141a] border border-white/5 rounded-t-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide truncate">
            {stage}
          </span>
        </div>
        <span className="bg-white/10 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0">
          {leads.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`bg-[#0f0f16] border-x border-b border-white/5 rounded-b-2xl min-h-48 p-2 space-y-2 transition-all ${
          isOver ? 'border-2 border-dashed' : ''
        }`}
        style={
          isOver
            ? {
                borderColor: color,
                boxShadow: `inset 0 0 0 1px ${color}33`,
                background: `${color}0D`
              }
            : undefined
        }
      >
        {leads.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6">No leads</p>
        ) : (
          leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={onCardClick} />
          ))
        )}
      </div>
    </div>
  );
}

function OverlayCard({ lead }) {
  if (!lead) return null;
  const borderColor = STAGE_COLORS[lead.pipelineStage] || '#6b7280';

  return (
    <div
      className="bg-[#14141a] border-2 rounded-2xl shadow-xl p-4 w-72 pointer-events-none"
      style={{ borderColor }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-bold text-white truncate text-sm">{lead.fullName}</div>
          <div className="text-gray-500 text-xs truncate">{lead.company || '—'}</div>
        </div>
        <ScoreBadge score={lead.aiScore} />
      </div>
    </div>
  );
}

export default function PipelinePage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState(null);
  const [error, setError] = useState('');
  const [confirmMove, setConfirmMove] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const fetchLeads = useCallback(async () => {
    try {
      const res = await getLeads();
      setLeads(res.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const leadsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter((l) => l.pipelineStage === stage);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    const lead = event.active.data.current?.lead;
    setActiveLead(lead || null);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const lead = active.data.current?.lead;
    const newStage = over.id;
    if (!lead || !STAGES.includes(newStage)) return;
    if (lead.pipelineStage === newStage) return;

    setConfirmMove({ lead, newStage });
  };

  const executeMove = async () => {
    if (!confirmMove) return;
    const { lead, newStage } = confirmMove;
    const leadId = lead.id;
    const previousStage = lead.pipelineStage;

    // Optimistic update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, pipelineStage: newStage } : l))
    );
    setError('');
    setConfirmMove(null);

    try {
      await updateLeadStage(leadId, newStage);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Failed to move lead to ${newStage}`);
      try {
        const res = await getLeads();
        setLeads(res.data || []);
      } catch {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, pipelineStage: previousStage } : l))
        );
      }
    }
  };

  const handleCardClick = (id) => navigate(`/leads/${id}`);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
          <p className="text-gray-500 text-sm">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <ConfirmModal isOpen={!!confirmMove} onClose={() => setConfirmMove(null)} onConfirm={executeMove} title="Move Pipeline Stage" message={"Are you sure you want to move this lead to ? This may automatically generate an AI draft."} confirmText="Move" />
      <div className="max-w-[1600px] mx-auto space-y-6">
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
              <h1 className="text-2xl font-bold text-white">Pipeline</h1>
              <p className="text-sm text-gray-500">
                {leads.length} lead{leads.length !== 1 ? 's' : ''} across {STAGES.length} stages
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <DroppableColumn
                key={stage}
                stage={stage}
                leads={leadsByStage[stage] || []}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          <DragOverlay>
            <OverlayCard lead={activeLead} />
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
