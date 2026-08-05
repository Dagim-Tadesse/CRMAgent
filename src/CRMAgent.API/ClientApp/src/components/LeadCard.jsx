import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, Clock } from 'lucide-react';
import { ScoreBadge, EmotionBadge } from './Badges';

const STAGE_COLORS = {
  New: '#2E86C1',
  Contacted: '#5DADE2',
  Qualified: '#F4D03F',
  ProposalSent: '#F39C12',
  Negotiation: '#E67E22',
  Won: '#27AE60',
  Lost: '#E74C3C'
};

function FlagPill({ flag }) {
  const styles = {
    isAtRisk: 'bg-red-500/20 text-red-300 border border-red-500/20',
    isStagnant: 'bg-orange-500/20 text-orange-300 border border-orange-500/20'
  };
  const icons = { isAtRisk: AlertCircle, isStagnant: Clock };
  const labels = { isAtRisk: 'At Risk', isStagnant: 'Stagnant' };
  const Icon = icons[flag];

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${styles[flag]}`}>
      <Icon size={12} />
      {labels[flag]}
    </span>
  );
}

function formatShortDate(value) {
  if (!value) return 'No activity';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'No activity';
  }
}

export default function LeadCard({ lead, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `lead-${lead.id}`,
    data: { lead }
  });

  const stageColor = STAGE_COLORS[lead.pipelineStage] || '#6b7280';

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick?.(lead.id)}
      className={`bg-[#14141a] border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Stage accent bar */}
      <div
        className="h-1 w-10 rounded-full mb-3"
        style={{ background: stageColor }}
      />

      {/* Top row: name/company + score */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-white truncate text-sm">{lead.fullName}</div>
          <div className="text-gray-500 text-xs truncate">{lead.company || '—'}</div>
        </div>
        <ScoreBadge score={lead.aiScore} />
      </div>

      {/* Second row: emotion + flags */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <EmotionBadge emotion={lead.emotion} />
        {lead.isAtRisk && <FlagPill flag="isAtRisk" />}
        {lead.isStagnant && <FlagPill flag="isStagnant" />}
      </div>

      {/* Thin progress-style accent */}
      <div className="h-0.5 w-full rounded-full bg-white/5 mb-3 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(10, (lead.aiScore || 0) * 10))}%`,
            background: stageColor,
            opacity: 0.7
          }}
        />
      </div>

      {/* Bottom row: last interaction */}
      <div className="text-xs text-gray-500 text-right">
        {formatShortDate(lead.lastInteractionAt)}
      </div>
    </div>
  );
}

export { STAGE_COLORS };
