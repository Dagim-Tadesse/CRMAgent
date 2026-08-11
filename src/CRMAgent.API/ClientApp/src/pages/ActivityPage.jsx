import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Clock, Search, Filter, X } from 'lucide-react';
import { getLogs } from '../api/apiClient';

const triggerBadge = {
  Agent: 'bg-purple-500/20 text-purple-300 border border-purple-500/20',
  User: 'bg-blue-500/20 text-blue-300 border border-blue-500/20',
  BackgroundJob: 'bg-orange-500/20 text-orange-300 border border-orange-500/20',
  TelegramWebhook: 'bg-teal-500/20 text-teal-300 border border-teal-500/20',
  EmailWebhook: 'bg-green-500/20 text-green-300 border border-green-500/20'
};

// Get unique trigger types for filter
const TRIGGER_TYPES = ['All', 'Agent', 'User', 'BackgroundJob', 'TelegramWebhook', 'EmailWebhook'];

export function ActivityPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrigger, setSelectedTrigger] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchLogs = () => {
      getLogs()
        .then((response) => {
          const data = response.data || [];
          setLogs(data);
          setFilteredLogs(data);
        })
        .catch((error) => console.error('Failed to fetch activity:', error))
        .finally(() => setLoading(false));
    };

    fetchLogs();

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchLogs, 15000);

    return () => clearInterval(interval);
  }, []);

  // Filter logs when search term or trigger filter changes
  useEffect(() => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(log =>
        log.action?.toLowerCase().includes(term) ||
        log.reason?.toLowerCase().includes(term) ||
        log.triggeredBy?.toLowerCase().includes(term)
      );
    }

    // Trigger type filter
    if (selectedTrigger !== 'All') {
      filtered = filtered.filter(log => log.triggeredBy === selectedTrigger);
    }

    setFilteredLogs(filtered);
  }, [searchTerm, selectedTrigger, logs]);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedTrigger('All');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
          <p className="text-gray-500 text-sm">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Back to dashboard
            </button>
            <h1 className="text-2xl font-semibold mt-2">Activity Timeline</h1>
            <p className="text-sm text-gray-500">Recent lead, system, and pipeline events</p>
          </div>
          
          {/* Search and Filter */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activity..."
                className="w-64 bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition ${
                showFilters || selectedTrigger !== 'All'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Filter size={18} />
            </button>

            {/* Clear Filters Button */}
            {(searchTerm || selectedTrigger !== 'All') && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-gray-500 hover:text-white transition px-2 py-1"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdown */}
        {showFilters && (
          <div className="bg-[#14141a] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Filters</span>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[150px]">
                <label className="text-xs text-gray-500 block mb-1.5">Trigger Type</label>
                <select
                  value={selectedTrigger}
                  onChange={(e) => setSelectedTrigger(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none transition"
                >
                  {TRIGGER_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#14141a]">
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Activity Table */}
        <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Recent Activity</h2>
              <p className="text-xs text-gray-500">
                {filteredLogs.length} of {logs.length} events
                {(searchTerm || selectedTrigger !== 'All') && ' (filtered)'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={14} />
              <span>Auto-refresh every 15s</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Reason</th>
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                      <td className="py-3 font-medium text-white">{log.action}</td>
                      <td className="py-3 text-gray-400 max-w-xl truncate">{log.reason}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${triggerBadge[log.triggeredBy] || 'bg-white/5 text-gray-400 border border-white/5'}`}>
                          {log.triggeredBy}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs text-right whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      <div className="text-center py-12">
                        <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-3">
                          <Search size={20} className="text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-sm">No matching activities found</p>
                        <button
                          onClick={handleClearFilters}
                          className="text-xs text-blue-400 hover:text-blue-300 mt-2 transition"
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && !searchTerm && selectedTrigger === 'All' && (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-3">
                <Activity size={20} className="text-gray-500" />
              </div>
              <p className="text-gray-500 text-sm">No activity yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}