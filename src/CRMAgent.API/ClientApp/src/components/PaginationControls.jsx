import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Compact pagination controls for lists / Kanban columns.
 */
export default function PaginationControls({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = ''
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={`flex items-center justify-between gap-2 pt-2 border-t border-white/5 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={14} />
      </button>

      <div className="text-center min-w-0">
        <div className="text-[11px] text-gray-400 font-medium">
          Page {page} of {totalPages}
        </div>
        <div className="text-[10px] text-gray-600 truncate">
          {from}–{to} of {totalItems}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
