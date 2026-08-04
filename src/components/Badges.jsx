// Score Badge
export function ScoreBadge({ score }) {
  const getColor = (score) => {
    if (score >= 8) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20';
    if (score >= 6) return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20';
    if (score >= 4) return 'bg-orange-500/20 text-orange-300 border border-orange-500/20';
    return 'bg-red-500/20 text-red-300 border border-red-500/20';
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getColor(score)}`}>
      {score || 'N/A'}
    </span>
  );
}

// Emotion Badge
export function EmotionBadge({ emotion }) {
  const styles = {
    Excited: 'bg-green-500/20 text-green-300 border border-green-500/20',
    Satisfied: 'bg-blue-500/20 text-blue-300 border border-blue-500/20',
    Neutral: 'bg-gray-500/20 text-gray-300 border border-gray-500/20',
    Confused: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20',
    Frustrated: 'bg-red-500/20 text-red-300 border border-red-500/20'
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[emotion] || 'bg-white/5 text-gray-400 border border-white/5'}`}>
      {emotion || 'Unknown'}
    </span>
  );
}