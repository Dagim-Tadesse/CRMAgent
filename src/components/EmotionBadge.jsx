export function EmotionBadge({ emotion }) {
  const styles = {
    Excited:    'bg-green-100 text-green-800',
    Frustrated: 'bg-red-100 text-red-800',
    Confused:   'bg-yellow-100 text-yellow-800',
    Satisfied:  'bg-blue-100 text-blue-800',
    Neutral:    'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[emotion]||styles.Neutral}`}>
      {emotion || 'Neutral'}
    </span>
  );
}