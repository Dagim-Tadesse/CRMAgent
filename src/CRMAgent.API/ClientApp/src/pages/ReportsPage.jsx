// pages/ReportsPage.jsx
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Target,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Zap,
  Bell,
  Menu,
  User,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Share2,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  Eye,
  Info,
  ThumbsUp,
  UserPlus
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

// =============== CONSTANTS ===============
const CHANNEL_COLORS = {
  Telegram: '#3b82f6',
  Website: '#8b5cf6',
  Email: '#22c55e'
};

const CHANNEL_ICONS = {
  Telegram: MessageCircle,
  Website: ExternalLink,
  Email: Mail
};

const CHANNEL_LABELS = {
  Telegram: 'Telegram',
  Website: 'Website Form',
  Email: 'Email'
};

// =============== MOCK DATA ===============
const mockChannelLeads = [
  { channel: 'Telegram', count: 42, color: '#3b82f6' },
  { channel: 'Website', count: 28, color: '#8b5cf6' },
  { channel: 'Email', count: 15, color: '#22c55e' },
];

const mockChannelClassification = [
  { channel: 'Telegram', hot: 18, medium: 15, low: 9, total: 42 },
  { channel: 'Website', hot: 12, medium: 10, low: 6, total: 28 },
  { channel: 'Email', hot: 4, medium: 6, low: 5, total: 15 },
];

const mockHotLeadsByChannel = mockChannelClassification.map(c => ({
  channel: c.channel,
  value: c.hot,
  color: c.channel === 'Telegram' ? '#3b82f6' : c.channel === 'Website' ? '#8b5cf6' : '#22c55e'
}));

const mockFullReport = [
  { 
    channel: 'Telegram', 
    totalLeads: 42, 
    hot: 18, 
    medium: 15, 
    low: 9, 
    avgScore: 6.4, 
    wonDeals: 5,
    conversionRate: '11.9%',
    color: '#3b82f6'
  },
  { 
    channel: 'Website', 
    totalLeads: 28, 
    hot: 12, 
    medium: 10, 
    low: 6, 
    avgScore: 6.1, 
    wonDeals: 3,
    conversionRate: '10.7%',
    color: '#8b5cf6'
  },
  { 
    channel: 'Email', 
    totalLeads: 15, 
    hot: 4, 
    medium: 6, 
    low: 5, 
    avgScore: 4.9, 
    wonDeals: 1,
    conversionRate: '6.7%',
    color: '#22c55e'
  },
];

const mockLeadsByChannel = {
  Telegram: [
    { id: 1, name: 'Alice Johnson', score: 9, status: 'Hot', stage: 'ProposalSent', createdAt: '2026-03-01' },
    { id: 2, name: 'Bob Smith', score: 7, status: 'Medium', stage: 'Contacted', createdAt: '2026-03-02' },
    { id: 3, name: 'Carol White', score: 4, status: 'Low', stage: 'New', createdAt: '2026-03-03' },
  ],
  Website: [
    { id: 4, name: 'David Brown', score: 8, status: 'Hot', stage: 'Qualified', createdAt: '2026-03-01' },
    { id: 5, name: 'Eve Davis', score: 6, status: 'Medium', stage: 'Contacted', createdAt: '2026-03-04' },
  ],
  Email: [
    { id: 6, name: 'Frank Wilson', score: 5, status: 'Medium', stage: 'New', createdAt: '2026-03-05' },
    { id: 7, name: 'Grace Lee', score: 3, status: 'Low', stage: 'New', createdAt: '2026-03-06' },
  ],
};

// =============== SIDEBAR ===============
function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Users, label: 'Leads', to: '/leads' },
    { icon: FileText, label: 'Reports', to: '/reports' },
    { icon: Activity, label: 'Activity', to: '/activity' },
    { icon: Target, label: 'Goals', to: '/goals' },
    { icon: CalendarIcon, label: 'Schedule', to: '/schedule' },
    { icon: SettingsIcon, label: 'Settings', to: '/settings' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}
      
      <div className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0a0a0f] border-r border-white/5
        text-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">LeadFlow</h1>
              <p className="text-xs text-gray-500">Analytics Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              onClick={toggleSidebar}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-white/10 text-white shadow-lg shadow-blue-500/10 border border-white/5' 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={isActive ? 'text-blue-400' : ''} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <User size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">john@example.com</p>
            </div>
            <button className="text-gray-500 hover:text-white transition">
              <SettingsIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// =============== STAT CARD ===============
function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition duration-300`}>
          <Icon size={18} className="text-white" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

// =============== CHANNEL BADGE ===============
function ChannelBadge({ channel }) {
  const Icon = CHANNEL_ICONS[channel];
  const color = CHANNEL_COLORS[channel];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium`}
      style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}30` }}
    >
      <Icon size={12} />
      {channel}
    </span>
  );
}

// =============== CUSTOM TOOLTIP ===============
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

// =============== REPORTS PAGE ===============
export function ReportsPage() {
  const navigate = useNavigate();
  const { email, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [reportData, setReportData] = useState(mockFullReport);
  const [channelLeads, setChannelLeads] = useState(mockChannelLeads);
  const [classificationData, setClassificationData] = useState(mockChannelClassification);
  const [hotLeadsData, setHotLeadsData] = useState(mockHotLeadsByChannel);
  const [leadsByChannel, setLeadsByChannel] = useState(mockLeadsByChannel);
  const [loading, setLoading] = useState(false);
  const [expandedChannel, setExpandedChannel] = useState(null);

  // Calculate totals
  const totalLeads = reportData.reduce((sum, r) => sum + r.totalLeads, 0);
  const totalHot = reportData.reduce((sum, r) => sum + r.hot, 0);
  const totalWon = reportData.reduce((sum, r) => sum + r.wonDeals, 0);
  const avgScore = (reportData.reduce((sum, r) => sum + (r.avgScore * r.totalLeads), 0) / totalLeads).toFixed(1);

  // Get top channel
  const topChannel = reportData.reduce((a, b) => a.totalLeads > b.totalLeads ? a : b);

  // Get channel with most hot leads
  const topHotChannel = reportData.reduce((a, b) => a.hot > b.hot ? a : b);

  const toggleChannelExpand = (channel) => {
    setExpandedChannel(expandedChannel === channel ? null : channel);
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 min-w-0">
        {/* Header */}
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
                <h1 className="text-2xl font-bold text-white">Reports</h1>
                <p className="text-sm text-gray-500">Social media analytics & channel performance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0f0f16]"></span>
              </button>
              <button className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-2 text-sm">
                <Download size={16} />
                Export
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{email}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/25">
                  {email ? email[0].toUpperCase() : '?'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* ============ STAT CARDS ============ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total Leads"
              value={totalLeads}
              sub={`From ${reportData.length} channels`}
              color="bg-blue-500"
              trend={8}
            />
            <StatCard
              icon={Star}
              label="Hot Leads (8+)"
              value={totalHot}
              sub={`${((totalHot / totalLeads) * 100).toFixed(1)}% of total`}
              color="bg-orange-500"
              trend={12}
            />
            <StatCard
              icon={Award}
              label="Won Deals"
              value={totalWon}
              sub={`${((totalWon / totalLeads) * 100).toFixed(1)}% conversion`}
              color="bg-green-500"
              trend={5}
            />
            <StatCard
              icon={TrendingUp}
              label="Avg. AI Score"
              value={avgScore}
              sub={`Top channel: ${topChannel.channel}`}
              color="bg-purple-500"
            />
          </div>

          {/* ============ TOP CHANNEL HIGHLIGHT ============ */}
          <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Top Performing Channel</h2>
                <p className="text-xs text-gray-500">Based on total leads and conversion rate</p>
              </div>
              <div className="flex items-center gap-2">
                <ChannelBadge channel={topChannel.channel} />
                <span className="text-xs text-gray-500">Best performer</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500">Total Leads</p>
                <p className="text-xl font-bold text-white">{topChannel.totalLeads}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500">Hot Leads</p>
                <p className="text-xl font-bold text-white">{topChannel.hot}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-500">Conversion Rate</p>
                <p className="text-xl font-bold text-white">{topChannel.conversionRate}</p>
              </div>
            </div>
          </div>

          {/* ============ CHARTS ROW ============ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart 1: Channel Distribution */}
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Channel Distribution</h3>
                  <p className="text-xs text-gray-500">Leads by source</p>
                </div>
                <PieChartIcon size={18} className="text-blue-400" />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={channelLeads}
                    dataKey="count"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {channelLeads.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedChannel(entry.channel)}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-gray-400 text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {channelLeads.map(c => (
                  <div key={c.channel} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs text-gray-400">{c.channel}</span>
                    <span className="text-xs font-medium text-white">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart 2: Hot Leads by Channel */}
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Hot Leads by Channel</h3>
                  <p className="text-xs text-gray-500">Leads with AI Score 8+</p>
                </div>
                <Star size={18} className="text-yellow-400" />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={hotLeadsData}
                    dataKey="value"
                    nameKey="channel"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {hotLeadsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedChannel(entry.channel)}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-gray-400 text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {hotLeadsData.map(c => (
                  <div key={c.channel} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-xs text-gray-400">{c.channel}</span>
                    <span className="text-xs font-medium text-white">{c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ CLASSIFICATION BAR CHART ============ */}
          <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Lead Classification by Channel</h3>
                <p className="text-xs text-gray-500">Hot / Medium / Low distribution</p>
              </div>
              <BarChart3 size={18} className="text-blue-400" />
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classificationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                <XAxis dataKey="channel" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top"
                  formatter={(value) => <span className="text-gray-400 text-xs">{value}</span>}
                />
                <Bar dataKey="hot" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="medium" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="low" stackId="a" fill="#6b7280" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ============ DETAILED REPORT TABLE ============ */}
          <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Channel Performance Report</h3>
                <p className="text-xs text-gray-500">Detailed metrics by source</p>
              </div>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition">
                View All →
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                    <th className="pb-3 font-medium">Channel</th>
                    <th className="pb-3 font-medium text-center">Total</th>
                    <th className="pb-3 font-medium text-center">Hot (8+)</th>
                    <th className="pb-3 font-medium text-center">Medium (5-7)</th>
                    <th className="pb-3 font-medium text-center">Low (1-4)</th>
                    <th className="pb-3 font-medium text-center">Avg Score</th>
                    <th className="pb-3 font-medium text-center">Won Deals</th>
                    <th className="pb-3 font-medium text-center">Conv. Rate</th>
                    <th className="pb-3 font-medium text-center">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <>
                      <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                            <span className="text-white font-medium">{row.channel}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center text-white">{row.totalLeads}</td>
                        <td className="py-3 text-center text-yellow-400">{row.hot}</td>
                        <td className="py-3 text-center text-blue-400">{row.medium}</td>
                        <td className="py-3 text-center text-gray-400">{row.low}</td>
                        <td className="py-3 text-center text-white font-medium">{row.avgScore}</td>
                        <td className="py-3 text-center text-green-400">{row.wonDeals}</td>
                        <td className="py-3 text-center text-white">{row.conversionRate}</td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => toggleChannelExpand(row.channel)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-400 hover:text-white"
                          >
                            {expandedChannel === row.channel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                      </tr>
                      {/* Expanded row with lead details */}
                      {expandedChannel === row.channel && leadsByChannel[row.channel] && (
                        <tr>
                          <td colSpan={9} className="py-4 bg-white/5 rounded-xl">
                            <div className="px-4">
                              <p className="text-xs font-medium text-gray-400 mb-3">
                                Recent leads from {row.channel}
                              </p>
                              <div className="space-y-2">
                                {leadsByChannel[row.channel].slice(0, 3).map((lead) => (
                                  <div key={lead.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm text-white">{lead.name}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        lead.status === 'Hot' ? 'bg-orange-500/20 text-orange-400' :
                                        lead.status === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-gray-500/20 text-gray-400'
                                      }`}>
                                        {lead.status}
                                      </span>
                                      <span className="text-xs text-gray-500">{lead.stage}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">{lead.createdAt}</span>
                                  </div>
                                ))}
                                {leadsByChannel[row.channel].length > 3 && (
                                  <button className="text-xs text-blue-400 hover:text-blue-300 transition">
                                    View all {leadsByChannel[row.channel].length} leads →
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============ SOCIAL MEDIA ANALYTICS ============ */}
          <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6 hover:border-white/10 transition-all">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white">Social Media Brand Engagement</h3>
              <p className="text-xs text-gray-500">Live signal metrics and sentiment tracking from n8n webhooks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chart 1: Platform Engagement */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400">Platform Volume</span>
                  <Activity size={14} className="text-blue-400" />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={[
                    { name: 'LinkedIn', count: 18, color: '#0A66C2' },
                    { name: 'Twitter', count: 24, color: '#1DA1F2' },
                    { name: 'Facebook', count: 12, color: '#1877F2' },
                    { name: 'Instagram', count: 15, color: '#E1306C' },
                    { name: 'TikTok', count: 20, color: '#00f2fe' }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Chart 2: Sentiment Breakdown */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400">Social Sentiment</span>
                  <TrendingUp size={14} className="text-green-400" />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Positive', value: 35, color: '#22c55e' },
                        { name: 'Neutral', value: 45, color: '#6b7280' },
                        { name: 'Negative', value: 9, color: '#ef4444' }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                    >
                      {[
                        { name: 'Positive', value: 35, color: '#22c55e' },
                        { name: 'Neutral', value: 45, color: '#6b7280' },
                        { name: 'Negative', value: 9, color: '#ef4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-3 mt-1">
                  <span className="text-[10px] text-green-400 font-medium">Positive (35)</span>
                  <span className="text-[10px] text-gray-400 font-medium">Neutral (45)</span>
                  <span className="text-[10px] text-red-400 font-medium">Negative (9)</span>
                </div>
              </div>

              {/* Chart 3: Signal Type Distribution */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-gray-400">Signal Interaction Types</span>
                  <ThumbsUp size={14} className="text-yellow-400" />
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Comment', value: 32, color: '#3b82f6' },
                        { name: 'Mention', value: 18, color: '#8b5cf6' },
                        { name: 'Like', value: 25, color: '#eab308' },
                        { name: 'Share', value: 10, color: '#ec4899' },
                        { name: 'Follow', value: 14, color: '#10b981' }
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={2}
                    >
                      {[
                        { name: 'Comment', value: 32, color: '#3b82f6' },
                        { name: 'Mention', value: 18, color: '#8b5cf6' },
                        { name: 'Like', value: 25, color: '#eab308' },
                        { name: 'Share', value: 10, color: '#ec4899' },
                        { name: 'Follow', value: 14, color: '#10b981' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center flex-wrap gap-2 mt-1">
                  <span className="text-[9px] text-[#3b82f6]">Comment</span>
                  <span className="text-[9px] text-[#8b5cf6]">Mention</span>
                  <span className="text-[9px] text-[#eab308]">Like</span>
                  <span className="text-[9px] text-[#ec4899]">Share</span>
                  <span className="text-[9px] text-[#10b981]">Follow</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============ INSIGHTS SECTION ============ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp size={16} className="text-green-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">Key Insights</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span><span className="text-white font-medium">{topChannel.channel}</span> is your best performing channel with <span className="text-white font-medium">{topChannel.totalLeads}</span> leads</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <span><span className="text-white font-medium">{topHotChannel.channel}</span> has the most hot leads (<span className="text-white font-medium">{topHotChannel.hot}</span>)</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Email channel has the lowest conversion rate (<span className="text-white font-medium">6.7%</span>) - consider improving outreach</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <Star size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span>Overall conversion rate is <span className="text-white font-medium">{((totalWon / totalLeads) * 100).toFixed(1)}%</span> across all channels</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Info size={16} className="text-blue-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">Recommendations</h4>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span>Focus more on <span className="text-white font-medium">Telegram</span> - it's your highest converting channel</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span>Improve <span className="text-white font-medium">Email</span> strategy - it has the most room for growth</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span><span className="text-white font-medium">Website Form</span> hot leads have high quality - prioritize them</span>
                </li>
                <li className="flex items-start gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span>Target <span className="text-white font-medium">{topHotChannel.channel}</span> for more high-quality leads</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}