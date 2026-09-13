// Score Badge
export function ScoreBadge({ score }) {
  const getColor = (score) => {
    if (score >= 8) return 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/20';
    if (score >= 6) return 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/20';
    if (score >= 4) return 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/20';
    return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/20';
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
    Excited: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/20',
    Satisfied: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/20',
    Neutral: 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/20',
    Confused: 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/20',
    Frustrated: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/20'
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[emotion] || 'bg-gray-100 dark:bg-white/5 text-gray-400 border border-gray-200 dark:border-white/5'}`}>
      {emotion || 'Unknown'}
    </span>
  );
}