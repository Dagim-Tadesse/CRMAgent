export function ScoreBadge({ score }) {
  const color = score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <span className={`${color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
      {score}/10
    </span>
  );
}