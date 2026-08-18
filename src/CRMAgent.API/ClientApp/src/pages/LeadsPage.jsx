import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getLeads, createLead, deleteLead } from '../api/apiClient';
import { 
  Search, Plus, X, Eye, Trash2, Filter,
  ChevronDown, ChevronUp, User, Building2, Mail,
  FileText, AlertCircle, CheckCircle, Clock, Users,
  ArrowLeft, Archive, ArchiveRestore, ChevronRight
} from 'lucide-react';
import { ScoreBadge, EmotionBadge } from '../components/Badges';
import { ConfirmModal } from '../components/Modal';
import { Loader } from '../components/Loader';

// Stage Badge Component
function StageBadge({ stage }) {
  const styles = {
    New: 'bg-blue-500/20 text-blue-300 border border-blue-500/20',
    Contacted: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20',
    Qualified: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/20',
    ProposalSent: 'bg-orange-500/20 text-orange-300 border border-orange-500/20',
    Negotiation: 'bg-purple-500/20 text-purple-300 border border-purple-500/20',
    Won: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20',
    Lost: 'bg-red-500/20 text-red-300 border border-red-500/20'
  };

  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[stage] || 'bg-white/5 text-gray-400 border border-white/5'}`}>
      {stage}
    </span>
  );
}

// Flag Badge Component
function FlagBadge({ flag }) {
  const styles = {
    isAtRisk: 'bg-red-500/20 text-red-300 border border-red-500/20',
    isStagnant: 'bg-orange-500/20 text-orange-300 border border-orange-500/20',
    isPriority: 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
  };

  const icons = {
    isAtRisk: AlertCircle,
    isStagnant: Clock,
    isPriority: CheckCircle
  };

  const labels = {
    isAtRisk: 'At Risk',
    isStagnant: 'Stagnant',
    isPriority: 'Priority'
  };

  const Icon = icons[flag];
  const label = labels[flag];

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${styles[flag]}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

// Add Lead Modal
function AddLeadModal({ isOpen, onClose, onLeadAdded }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    rawInquiryText: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createLead(formData);
      onLeadAdded();
      onClose();
      setFormData({ fullName: '', email: '', company: '', rawInquiryText: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14141a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white">Add New Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Email *
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Company
            </label>
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Raw Inquiry Text *
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3 top-3 text-gray-500" />
              <textarea
                required
                rows="4"
                value={formData.rawInquiryText}
                onChange={(e) => setFormData({ ...formData, rawInquiryText: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition resize-none"
                placeholder="I'm interested in your product... (AI will analyze this)"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Archive Suggestion Banner Component
function ArchiveSuggestionBanner({ staleLeadsCount, onReview }) {
  if (staleLeadsCount === 0) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Archive size={18} className="text-amber-400" />
        <div>
          <p className="text-sm text-white">
            <span className="font-medium">{staleLeadsCount}</span> stagnant lead{staleLeadsCount !== 1 ? 's' : ''} with no activity in 90+ days
          </p>
          <p className="text-xs text-gray-400">These leads may be candidates for archiving</p>
        </div>
      </div>
      <button
        onClick={onReview}
        className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium transition border border-amber-500/20"
      >
        Review & Archive
      </button>
    </div>
  );
}

export function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [displayedLeads, setDisplayedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedStage, setSelectedStage] = useState('All');
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived'
  const [staleLeadsCount, setStaleLeadsCount] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Pagination state
  const [visibleCount, setVisibleCount] = useState(15); // Start with 15 leads
  const INCREMENT = 15; // Load 15 more each time

  const stages = ['All', 'New', 'Contacted', 'Qualified', 'ProposalSent', 'Negotiation', 'Won', 'Lost'];

  useEffect(() => {
    fetchLeads();

    // Silent background refresh every 15 seconds
    const interval = setInterval(() => {
      fetchLeads(true);
    }, 15000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads, searchTerm, selectedStage, sortField, sortDirection, viewMode]);

  useEffect(() => {
    // Update displayed leads when filtered leads change or visible count changes
    updateDisplayedLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredLeads, visibleCount]);

  const fetchLeads = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const response = await getLeads();
      
      // Add isArchived field if not present (for backward compatibility)
      const leadsWithArchive = response.data.map(lead => ({
        ...lead,
        isArchived: lead.isArchived || false,
        archivedAt: lead.archivedAt || null
      }));
      
      setLeads(leadsWithArchive);
      setFilteredLeads(leadsWithArchive);
      
      // Reset visible count when data loads
      setVisibleCount(15);
      
      // Calculate stale leads count
      calculateStaleLeads(leadsWithArchive);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const calculateStaleLeads = (leadsData) => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
    
    const stale = leadsData.filter(lead => 
      !lead.isArchived &&
      !lead.isPriority &&
      !lead.isAtRisk &&
      lead.pipelineStage !== 'Qualified' &&
      lead.pipelineStage !== 'ProposalSent' &&
      lead.pipelineStage !== 'Negotiation' &&
      lead.isStagnant &&
      new Date(lead.lastInteractionAt || lead.updatedAt) < ninetyDaysAgo
    );
    
    setStaleLeadsCount(stale.length);
  };

  const filterLeads = () => {
    let filtered = [...leads];

    // Archive/Active filter
    filtered = filtered.filter(lead => 
      viewMode === 'active' ? !lead.isArchived : lead.isArchived
    );

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lead =>
        lead.fullName.toLowerCase().includes(term) ||
        lead.company?.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term)
      );
    }

    // Stage filter (only for active leads)
    if (selectedStage !== 'All' && viewMode === 'active') {
      filtered = filtered.filter(lead => lead.pipelineStage === selectedStage);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredLeads(filtered);
    // Reset visible count when filters change
    setVisibleCount(15);
  };

  const updateDisplayedLeads = () => {
    setDisplayedLeads(filteredLeads.slice(0, visibleCount));
  };

  const handleSeeMore = () => {
    setVisibleCount(prev => Math.min(prev + INCREMENT, filteredLeads.length));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDeleteClick = (id, e) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    try {
      await deleteLead(confirmDelete);
      // Refresh the leads list after deletion
      await fetchLeads();
    } catch (error) {
      console.error('Failed to delete lead:', error);
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    // TODO: Add backend call to archive lead
    const updatedLeads = leads.map(lead => 
      lead.id === id 
        ? { ...lead, isArchived: true, archivedAt: new Date().toISOString() } 
        : lead
    );
    setLeads(updatedLeads);
    setFilteredLeads(updatedLeads);
    calculateStaleLeads(updatedLeads);
  };

  const handleUnarchive = async (id, e) => {
    e.stopPropagation();
    // TODO: Add backend call to unarchive lead
    const updatedLeads = leads.map(lead => 
      lead.id === id 
        ? { ...lead, isArchived: false, archivedAt: null } 
        : lead
    );
    setLeads(updatedLeads);
    setFilteredLeads(updatedLeads);
    calculateStaleLeads(updatedLeads);
  };

  const handleReviewStaleLeads = () => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.setDate(now.getDate() - 90));
    
    const staleLeads = leads.filter(lead => 
      !lead.isArchived &&
      !lead.isPriority &&
      !lead.isAtRisk &&
      lead.pipelineStage !== 'Qualified' &&
      lead.pipelineStage !== 'ProposalSent' &&
      lead.pipelineStage !== 'Negotiation' &&
      lead.isStagnant &&
      new Date(lead.lastInteractionAt || lead.updatedAt) < ninetyDaysAgo
    );
    
    setSearchTerm('');
    setSelectedStage('All');
    setFilteredLeads(staleLeads);
    setVisibleCount(15);
    
    console.log(`Showing ${staleLeads.length} stale leads for review`);
  };

  const getFlagCount = (lead) => {
    let count = 0;
    if (lead.isAtRisk) count++;
    if (lead.isStagnant) count++;
    if (lead.isPriority) count++;
    return count;
  };

  const getLeadChannel = (lead) => {
    return lead.source || 'WebForm';
  };

  if (loading) {
    return <Loader fullScreen={true} message="Loading leads database..." />;
  }

  const hasMoreLeads = visibleCount < filteredLeads.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Lead"
        message="Are you sure you want to permanently delete this lead? This action cannot be undone and all interaction history will be lost."
        isDestructive={true}
        confirmText="Delete"
      />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm">Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Leads</h1>
              <p className="text-sm text-gray-500">
                {viewMode === 'active' 
                  ? 'Manage and track your active leads' 
                  : 'View archived leads'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-xl bg-white/5 border border-white/10 p-1">
              <button
                onClick={() => setViewMode('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewMode === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setViewMode('archived')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  viewMode === 'archived'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Archive size={14} />
                Archived
              </button>
            </div>
            
            {viewMode === 'active' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition"
              >
                <Plus size={18} />
                Add Lead
              </button>
            )}
          </div>
        </div>

        {/* Archive Suggestion Banner (only in active view) */}
        {viewMode === 'active' && (
          <ArchiveSuggestionBanner 
            staleLeadsCount={staleLeadsCount}
            onReview={handleReviewStaleLeads}
          />
        )}

        {/* Filters */}
        <div className="bg-[#14141a] border border-white/5 rounded-2xl p-4">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={viewMode === 'active' 
                  ? "Search by name, company, or email..." 
                  : "Search archived leads..."}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
              />
            </div>

            {/* Stage Filter - only for active leads */}
            {viewMode === 'active' && (
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none transition"
                >
                  {stages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Results count */}
            <div className="text-sm text-gray-500 ml-auto">
              Showing {displayedLeads.length} of {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#14141a] border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-white/5">
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:text-white transition"
                    onClick={() => handleSort('fullName')}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {sortField === 'fullName' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:text-white transition"
                    onClick={() => handleSort('company')}
                  >
                    <div className="flex items-center gap-1">
                      Company
                      {sortField === 'company' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  {viewMode === 'active' && (
                    <>
                      <th className="px-6 py-4 font-medium">Score</th>
                      <th className="px-6 py-4 font-medium">Emotion</th>
                      <th className="px-6 py-4 font-medium">Stage</th>
                    </>
                  )}
                  <th className="px-6 py-4 font-medium">Source</th>
                  {viewMode === 'active' && (
                    <th className="px-6 py-4 font-medium">Flags</th>
                  )}
                  <th 
                    className="px-6 py-4 font-medium cursor-pointer hover:text-white transition"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center gap-1">
                      {viewMode === 'active' ? 'Last Contact' : 'Archived Date'}
                      {sortField === 'updatedAt' && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => navigate(`/leads/${lead.id}`)}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{lead.fullName}</div>
                      <div className="text-xs text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{lead.company || '-'}</td>
                    
                    {viewMode === 'active' && (
                      <>
                        <td className="px-6 py-4">
                          <ScoreBadge score={lead.aiScore} />
                        </td>
                        <td className="px-6 py-4">
                          <EmotionBadge emotion={lead.emotion} />
                        </td>
                        <td className="px-6 py-4">
                          <StageBadge stage={lead.pipelineStage} />
                        </td>
                      </>
                    )}
                    
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        getLeadChannel(lead) === 'Telegram' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' :
                        getLeadChannel(lead) === 'Email' ? 'bg-green-500/20 text-green-300 border border-green-500/20' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                      }`}>
                        {getLeadChannel(lead) === 'WebForm' ? 'Website Form' : getLeadChannel(lead)}
                      </span>
                    </td>
                    
                    {viewMode === 'active' && (
                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {lead.isAtRisk && <FlagBadge flag="isAtRisk" />}
                          {lead.isStagnant && <FlagBadge flag="isStagnant" />}
                          {lead.isPriority && <FlagBadge flag="isPriority" />}
                          {getFlagCount(lead) === 0 && (
                            <span className="text-xs text-gray-500">-</span>
                          )}
                        </div>
                      </td>
                    )}
                    
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {viewMode === 'active' 
                        ? (lead.lastInteractionAt 
                            ? new Date(lead.lastInteractionAt).toLocaleDateString() 
                            : new Date(lead.createdAt).toLocaleDateString())
                        : (lead.archivedAt 
                            ? new Date(lead.archivedAt).toLocaleDateString()
                            : 'N/A')
                      }
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead.id}`);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
                        >
                          <Eye size={16} />
                        </button>
                        
                        {viewMode === 'active' ? (
                          <>
                            <button
                              onClick={(e) => handleArchive(lead.id, e)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition"
                              title="Archive lead"
                            >
                              <Archive size={16} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(lead.id, e)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => handleUnarchive(lead.id, e)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                            title="Restore from archive"
                          >
                            <ArchiveRestore size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* See More Button */}
          {hasMoreLeads && (
            <div className="border-t border-white/5 p-4">
              <button
                onClick={handleSeeMore}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center justify-center gap-2 text-sm font-medium group"
              >
                <span>See More Leads</span>
                <ChevronRight 
                  size={16} 
                  className="group-hover:translate-x-1 transition-transform" 
                />
                <span className="text-xs text-gray-500">
                  ({filteredLeads.length - visibleCount} more)
                </span>
              </button>
            </div>
          )}

          {filteredLeads.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                {viewMode === 'active' ? (
                  <Users size={24} className="text-gray-500" />
                ) : (
                  <Archive size={24} className="text-gray-500" />
                )}
              </div>
              <p className="text-gray-400">
                {viewMode === 'active' ? 'No active leads found' : 'No archived leads'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {viewMode === 'active' 
                  ? 'Try adjusting your search or filters' 
                  : 'Archived leads will appear here'}
              </p>
            </div>
          )}
        </div>

        {/* Add Lead Modal */}
        <AddLeadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onLeadAdded={fetchLeads}
        />
      </div>
    </div>
  );
}