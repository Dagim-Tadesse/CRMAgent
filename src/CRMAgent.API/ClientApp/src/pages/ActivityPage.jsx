import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Clock, Search } from 'lucide-react';
import { getLogs } from '../api/apiClient';

const triggerBadge = {
  Agent: 'bg-purple-500/20 text-purple-300 border border-purple-500/20',
  User: 'bg-blue-500/20 text-blue-300 border border-blue-500/20',
  BackgroundJob: 'bg-orange-500/20 text-orange-300 border border-orange-500/20',
  TelegramWebhook: 'bg-teal-500/20 text-teal-300 border border-teal-500/20',
  EmailWebhook: 'bg-green-500/20 text-green-300 border border-green-500/20'
};

export function ActivityPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLogs()
      .then((response) => setLogs(response.data || []))
      .catch((error) => console.error('Failed to fetch activity:', error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              <ArrowLeft size={16} />
              Back to dashboard
            </button>
            <h1 className="text-2xl font-semibold mt-2">Activity Timeline</h1>
            <p className="text-sm text-gray-500">Recent lead, system, and pipeline events</p>
          </div>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-400">
            <Search size={16} />
            <span>Filtered activity stream</span>
          </div>
        </div>

        <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Recent Activity</h2>
              <p className="text-xs text-gray-500">Latest system events and actions</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={14} />
              <span>{logs.length} events</span>
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
                {logs.map((log) => (
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
                ))}
              </tbody>
            </table>
          </div>

          {logs.length === 0 && (
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
