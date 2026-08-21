import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLogs } from '../api/apiClient';
import { 
  Search, Filter, Calendar, Activity, Zap,
  User, Database, Send, Mail, RefreshCw, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/Loader';

// Trigger Badge Component
function TriggerBadge({ trigger }) {
  const styles = {
    Agent: 'bg-purple-500/20 text-purple-300 border border-purple-500/20',
    User: 'bg-blue-500/20 text-blue-300 border border-blue-500/20',
    BackgroundJob: 'bg-orange-500/20 text-orange-300 border border-orange-500/20',
    TelegramWebhook: 'bg-teal-500/20 text-teal-300 border border-teal-500/20',
    EmailWebhook: 'bg-green-500/20 text-green-300 border border-green-500/20'
  };

  const icons = {
    Agent: User,
    User: User,
    BackgroundJob: Database,
    TelegramWebhook: Send,
    EmailWebhook: Mail
  };

  const Icon = icons[trigger] || Activity;

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 ${styles[trigger] || 'bg-white/5 text-gray-400 border border-white/5'}`}>
      <Icon size={12} />
      {trigger}
    </span>
  );
}

// Action Icon
function ActionIcon({ action }) {
  const iconMap = {
    'Lead Created': Zap,
    'Lead Updated': RefreshCw,
    'Email Sent': Mail,
    'Lead Scored': Activity,
    'Stage Changed': Activity
  };

  const Icon = iconMap[action] || Activity;
  return <Icon size={14} className="text-gray-500" />;
}

export function ActivityLogPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const triggerOptions = ['Agent', 'User', 'BackgroundJob', 'TelegramWebhook', 'EmailWebhook'];

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchLogs, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterLogs();
    setCurrentPage(1);
  }, [logs, searchTerm, selectedTriggers, dateRange, itemsPerPage]);

  const fetchLogs = async () => {
    try {
      const response = await getLogs();
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(term) ||
        log.reason?.toLowerCase().includes(term) ||
        log.leadName?.toLowerCase().includes(term)
      );
    }

    // Trigger filter
    if (selectedTriggers.length > 0) {
      filtered = filtered.filter(log => 
        selectedTriggers.includes(log.triggeredBy)
      );
    }

    // Date range filter
    if (dateRange.start) {
      const start = new Date(dateRange.start);
      filtered = filtered.filter(log => new Date(log.createdAt) >= start);
    }
    if (dateRange.end) {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59);
      filtered = filtered.filter(log => new Date(log.createdAt) <= end);
    }

    // Sort by time descending
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredLogs(filtered);
  };

  const toggleTrigger = (trigger) => {
    setSelectedTriggers(prev =>
      prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTriggers([]);
    setDateRange({ start: '', end: '' });
  };

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return <Loader message="Loading activity logs..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-2"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Activity Log</h1>
          <p className="text-sm text-gray-500">Monitor all system events and actions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none transition cursor-pointer"
          >
            <option value={10} className="bg-[#14141a]">10 per page</option>
            <option value={15} className="bg-[#14141a]">15 per page</option>
            <option value={25} className="bg-[#14141a]">25 per page</option>
            <option value={50} className="bg-[#14141a]">50 per page</option>
            <option value={100} className="bg-[#14141a]">100 per page</option>
          </select>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <div className="text-sm text-gray-500">
            {filteredLogs.length} event{filteredLogs.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#14141a] border border-white/5 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search actions, reasons, or leads..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none transition"
            />
            <span className="text-gray-500 text-sm">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        {/* Trigger Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm text-gray-500 mr-1">Source:</span>
          {triggerOptions.map(trigger => (
            <button
              key={trigger}
              onClick={() => toggleTrigger(trigger)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                selectedTriggers.includes(trigger)
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20'
                  : 'bg-white/5 text-gray-400 border border-white/5 hover:border-white/20'
              }`}
            >
              {trigger}
            </button>
          ))}
          {selectedTriggers.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-white transition ml-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#14141a] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Lead</th>
                <th className="px-6 py-4 font-medium">Reason</th>
                <th className="px-6 py-4 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/5 transition"
                >
                  <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ActionIcon action={log.action} />
                      <span className="text-white font-medium">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {log.leadName ? (
                      <span className="text-blue-400 hover:text-blue-300 transition cursor-pointer">
                        {log.leadName}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400 max-w-xs truncate">
                    {log.reason || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <TriggerBadge trigger={log.triggeredBy} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length > 0 && (
          <div className="bg-white/2 px-6 py-4 flex items-center justify-between border-t border-white/5 flex-wrap gap-4 text-xs text-gray-500">
            <div>
              Showing <span className="text-white font-medium">{startIndex + 1}</span> to <span className="text-white font-medium">{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of <span className="text-white font-medium">{filteredLogs.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                title="Previous Page"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition disabled:opacity-40 disabled:hover:bg-white/5 cursor-pointer disabled:cursor-not-allowed border border-white/5"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, i, arr) => {
                  return (
                    <span key={p} className="flex items-center gap-1">
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="px-1.5 text-gray-500 font-medium select-none">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        title={`Page ${p}`}
                        className={`w-7 h-7 rounded-lg font-medium transition cursor-pointer flex items-center justify-center ${
                          currentPage === p
                            ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                title="Next Page"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition disabled:opacity-40 disabled:hover:bg-white/5 cursor-pointer disabled:cursor-not-allowed border border-white/5"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
              <Activity size={24} className="text-gray-500" />
            </div>
            <p className="text-gray-400">No activity logs found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#14141a] border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-gray-500">Total Events</p>
          <p className="text-xl font-bold text-white">{logs.length}</p>
        </div>
        <div className="bg-[#14141a] border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-gray-500">Unique Sources</p>
          <p className="text-xl font-bold text-white">
            {new Set(logs.map(l => l.triggeredBy)).size}
          </p>
        </div>
        <div className="bg-[#14141a] border border-white/5 rounded-2xl p-4">
          <p className="text-xs text-gray-500">Most Active Source</p>
          <p className="text-xl font-bold text-white">
            {logs.length > 0 ? (
              Object.entries(
                logs.reduce((acc, log) => {
                  acc[log.triggeredBy] = (acc[log.triggeredBy] || 0) + 1;
                  return acc;
                }, {})
              ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
            ) : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}