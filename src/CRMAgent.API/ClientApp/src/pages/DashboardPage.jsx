/* eslint-disable */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeads, getLogs, getPendingTasks } from '../api/apiClient';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  BarChart, Bar, XAxis, Tooltip, LineChart, Line,
  AreaChart, Area, CartesianGrid, Legend
} from 'recharts';
import { 
  Users, Flame, AlertTriangle, Clock, Trophy, Ghost,
  User, Menu, BarChart3, Activity, Target,
  ArrowUp, ArrowDown, TrendingUp, Shield,
  Moon, Sun
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AppSidebar from '../components/AppSidebar';
import { Loader } from '../components/Loader';

// Stat Card Component - Dark Version
function StatCard({ icon: Icon, label, value, sub, iconBg, trend, trendValue }) {
  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-500/5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}

const EMOTION_COLORS = {
  Excited: '#22c55e', Satisfied: '#3b82f6', Neutral: '#6b7280',
  Confused: '#eab308', Frustrated: '#ef4444'
};

const STAGE_COLORS = {
  New: '#2E86C1', Contacted: '#5DADE2', Qualified: '#F4D03F',
  ProposalSent: '#F39C12', Negotiation: '#E67E22', Won: '#27AE60', Lost: '#E74C3C'
};

const triggerBadge = {
  Agent: 'bg-purple-500/20 text-purple-300 border border-purple-500/20',
  User: 'bg-blue-500/20 text-blue-300 border border-blue-500/20',
  BackgroundJob: 'bg-orange-500/20 text-orange-300 border border-orange-500/20',
  TelegramWebhook: 'bg-teal-500/20 text-teal-300 border border-teal-500/20',
  EmailWebhook: 'bg-green-500/20 text-green-300 border border-green-500/20'
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { email, role } = useAuth();
  const [leads, setLeads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, logsRes, pendingRes] = await Promise.all([
          getLeads(),
          getLogs(),
          getPendingTasks()
        ]);
        
        const allLeads = leadsRes.data || [];
        const visibleLeads = role === 'Admin' ? allLeads : allLeads.filter(l => l.assignedTo === email);
        
        setLeads(visibleLeads);
        setLogs(logsRes.data);
        setPending(pendingRes.data);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    const refreshData = () => {
      getLeads().then(res => {
        const allLeads = res.data || [];
        setLeads(role === 'Admin' ? allLeads : allLeads.filter(l => l.assignedTo === email));
      }).catch(console.error);
      getLogs().then(res => setLogs(res.data)).catch(console.error);
      getPendingTasks().then(res => setPending(res.data)).catch(console.error);
    };

    fetchData();
    
    // Auto-refresh in background every 15 seconds
    const interval = setInterval(refreshData, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Loader fullScreen={true} message="Loading dashboard data..." />;
  }

  const hotLeads = leads.filter(l => l.aiScore >= 8).length;
  const atRisk = leads.filter(l => l.isAtRisk).length;
  const stagnant = leads.filter(l => l.isStagnant).length;
  const won = leads.filter(l => l.pipelineStage === 'Won').length;
  const conversionRate = leads.length > 0 ? ((won / leads.length) * 100).toFixed(1) : 0;

  const emotionData = Object.entries(
    leads.reduce((acc, l) => { acc[l.emotion] = (acc[l.emotion]||0)+1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const stageData = Object.entries(
    leads.reduce((acc, l) => { acc[l.pipelineStage] = (acc[l.pipelineStage]||0)+1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  // Leads created per day, last 7 days
  const today = new Date();
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    return d;
  });
  const barData = last7.map(d => {
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const count = leads.filter(l => {
      const created = new Date(l.createdAt);
      return created.toDateString() === d.toDateString();
    }).length;
    return { day: label, leads: count };
  });

  // Generate mock trend data for line chart
  const trendData = last7.map((d, i) => ({
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    new: leads.filter(l => new Date(l.createdAt).toDateString() === d.toDateString()).length,
    won: leads.filter(l => 
      l.pipelineStage === 'Won' && 
      new Date(l.updatedAt).toDateString() === d.toDateString()
    ).length
  }));

  // Activity heatmap data
  const stageDistribution = stageData.map(item => ({
    ...item,
    percentage: ((item.value / leads.length) * 100).toFixed(1)
  }));

  // Custom tooltip for dark theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a1a24] border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-xs text-gray-400 mb-1">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="text-sm text-white">
              {p.name}: <span className="font-bold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <AppSidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Header - Dark */}
        <header className="bg-[#0f0f16] border-b border-white/5 sticky top-0 z-30 backdrop-blur-sm bg-opacity-90">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back! Here's your pipeline overview</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{email}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
                <div
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold"
                  style={{
                    background: 'linear-gradient(to right, var(--accent-color), var(--accent-color-dark))',
                    boxShadow: '0 10px 15px -3px var(--accent-color-shadow)'
                  }}
                >
                  {email ? email[0].toUpperCase() : '?'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={Users} 
              label='Total Leads' 
              value={leads.length} 
              iconBg='bg-gradient-to-r from-blue-500 to-blue-600'
              trend={12}
              trendValue='+12%'
            />
            <StatCard 
              icon={Flame} 
              label='Hot Leads (8+)' 
              value={hotLeads} 
              sub='AI score based' 
              iconBg='bg-gradient-to-r from-orange-500 to-red-500'
              trend={8}
              trendValue='+8%'
            />
            <StatCard 
              icon={AlertTriangle} 
              label='At Risk' 
              value={atRisk} 
              sub='No reply 3+ days' 
              iconBg='bg-gradient-to-r from-red-500 to-pink-500'
              trend={-3}
              trendValue='-3%'
            />
            <StatCard 
              icon={Trophy} 
              label='Conversion Rate' 
              value={`${conversionRate}%`} 
              sub={`${won} won deals`}
              iconBg='bg-gradient-to-r from-emerald-500 to-teal-500'
              trend={5}
              trendValue='+5%'
            />
          </div>

          {/* MAIN CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Line Chart - Lead Trends */}
            <div className="lg:col-span-2 bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold text-white">Lead Trends</h2>
                  <p className="text-xs text-gray-500">New vs Won leads over time</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-gray-400">New</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-gray-400">Won</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width='100%' height={280}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorNewDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorWonDark" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                  <XAxis dataKey='day' tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="new" stroke="#3b82f6" fill="url(#colorNewDark)" strokeWidth={2} />
                  <Area type="monotone" dataKey="won" stroke="#22c55e" fill="url(#colorWonDark)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Distribution */}
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
              <h2 className="text-sm font-semibold text-white mb-6">Stage Distribution</h2>
              <div className="space-y-3">
                {stageDistribution.map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[s.name] }} />
                        <span className="text-gray-400">{s.name}</span>
                      </div>
                      <span className="text-gray-500">{s.value} ({s.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${s.percentage}%`,
                          background: STAGE_COLORS[s.name]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECONDARY CHARTS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Emotion Donut */}
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
              <h2 className="text-sm font-semibold text-white mb-4">Emotion Breakdown</h2>
              <ResponsiveContainer width='100%' height={200}>
                <PieChart>
                  <Pie 
                    data={emotionData} 
                    dataKey='value' 
                    nameKey='name'
                    innerRadius={55} 
                    outerRadius={80} 
                    paddingAngle={3}
                  >
                    {emotionData.map((e, i) => (
                      <Cell key={i} fill={EMOTION_COLORS[e.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className='flex flex-wrap gap-2 justify-center mt-2'>
                {emotionData.map(e => (
                  <div key={e.name} className='flex items-center gap-1.5 text-xs text-gray-400'>
                    <span className='w-2 h-2 rounded-full' style={{ background: EMOTION_COLORS[e.name] }} />
                    <span>{e.name}</span>
                    <span className='font-medium text-white'>{e.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Stage Donut */}
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
              <h2 className="text-sm font-semibold text-white mb-4">Pipeline Stage</h2>
              <ResponsiveContainer width='100%' height={200}>
                <PieChart>
                  <Pie 
                    data={stageData} 
                    dataKey='value' 
                    nameKey='name'
                    innerRadius={55} 
                    outerRadius={80} 
                    paddingAngle={3}
                  >
                    {stageData.map((s, i) => (
                      <Cell key={i} fill={STAGE_COLORS[s.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className='flex flex-wrap gap-2 justify-center mt-2'>
                {stageData.map(s => (
                  <div key={s.name} className='flex items-center gap-1.5 text-xs text-gray-400'>
                    <span className='w-2 h-2 rounded-full' style={{ background: STAGE_COLORS[s.name] }} />
                    <span>{s.name}</span>
                    <span className='font-medium text-white'>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Leads Bar Chart */}
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
              <h2 className="text-sm font-semibold text-white mb-4">New Leads (Last 7 Days)</h2>
              <ResponsiveContainer width='100%' height={200}>
                <BarChart data={barData}>
                  <XAxis dataKey='day' tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='leads' fill='#2E86C1' radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 flex items-center justify-between hover:border-white/10 transition-all group">
              <div>
                <p className="text-xs text-gray-500">Avg. Score</p>
                <p className="text-xl font-bold text-white">
                  {leads.length > 0 ? (leads.reduce((acc, l) => acc + (l.aiScore || 0), 0) / leads.length).toFixed(1) : '0'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition">
                <TrendingUp size={18} className="text-blue-400" />
              </div>
            </div>
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 flex items-center justify-between hover:border-white/10 transition-all group">
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-xl font-bold text-white">{pending.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition">
                <Clock size={18} className="text-yellow-400" />
              </div>
            </div>
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 flex items-center justify-between hover:border-white/10 transition-all group">
              <div>
                <p className="text-xs text-gray-500">At Risk</p>
                <p className="text-xl font-bold text-white">{atRisk}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition">
                <Shield size={18} className="text-red-400" />
              </div>
            </div>
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 flex items-center justify-between hover:border-white/10 transition-all group">
              <div>
                <p className="text-xs text-gray-500">Stagnant</p>
                <p className="text-xl font-bold text-white">{stagnant}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition">
                <Ghost size={18} className="text-purple-400" />
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY TABLE */}
          <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
                <p className="text-xs text-gray-500">Latest system events and actions</p>
              </div>
              <button
                onClick={() => navigate('/activity')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
              >
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className='w-full text-sm'>
                <thead>
                  <tr className='text-left text-xs text-gray-500 border-b border-white/5'>
                    <th className='pb-3 font-medium'>Action</th>
                    <th className='pb-3 font-medium'>Reason</th>
                    <th className='pb-3 font-medium'>Source</th>
                    <th className='pb-3 font-medium text-right'>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 6).map(log => (
                    <tr key={log.id} className='border-b border-white/5 last:border-0 hover:bg-white/5 transition'>
                      <td className='py-3 font-medium text-white'>{log.action}</td>
                      <td className='py-3 text-gray-400 max-w-xs truncate'>{log.reason}</td>
                      <td className='py-3'>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${triggerBadge[log.triggeredBy]||'bg-white/5 text-gray-400 border border-white/5'}`}>
                          {log.triggeredBy}
                        </span>
                      </td>
                      <td className='py-3 text-gray-500 text-xs text-right whitespace-nowrap'>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {logs.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <Activity size={20} className="text-gray-500" />
                </div>
                <p className='text-gray-500 text-sm'>No activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
