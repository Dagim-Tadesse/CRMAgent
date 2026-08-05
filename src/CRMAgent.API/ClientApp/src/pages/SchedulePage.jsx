// pages/SchedulePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Video,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  Menu,
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Target,
  Settings,
  Bell,
  Zap,
  User as UserIcon,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  RefreshCw,
  MoreVertical,
  CalendarDays,
  ListChecks,
  GripVertical,
  Clock8,
  Link2,
  Star,
  Tag,
  Briefcase,
  Building2,
  MessageSquare,
  Paperclip,
  Repeat,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// =============== MOCK DATA ===============
const mockEvents = [
  {
    id: 1,
    title: "Demo Call - Acme Corp",
    lead: "John Smith",
    leadEmail: "john@acme.com",
    leadPhone: "+1 (555) 123-4567",
    company: "Acme Corporation",
    type: "Demo",
    start: new Date(2026, 7, 4, 10, 0),
    end: new Date(2026, 7, 4, 11, 0),
    notes: "Show them the new AI features. They're interested in automation.",
    location: "Video Call (Zoom)",
    status: "Scheduled",
    priority: "High",
    tags: ["Enterprise", "SaaS"],
    assignedTo: "Sarah Johnson",
    recurring: false,
    attachments: 2,
    completion: 0
  },
  {
    id: 2,
    title: "Discovery Call - TechStart Inc",
    lead: "Sarah Chen",
    leadEmail: "sarah@techstart.io",
    leadPhone: "+1 (555) 987-6543",
    company: "TechStart Inc",
    type: "Discovery",
    start: new Date(2026, 7, 4, 14, 30),
    end: new Date(2026, 7, 4, 15, 30),
    notes: "First introduction. They're a SaaS company looking for CRM.",
    location: "Zoom Meeting",
    status: "Scheduled",
    priority: "Medium",
    tags: ["Startup", "Tech"],
    assignedTo: "John Doe",
    recurring: false,
    attachments: 0,
    completion: 0
  },
  {
    id: 3,
    title: "Follow-up - Green Energy",
    lead: "Mike Johnson",
    leadEmail: "mike@greenenergy.com",
    leadPhone: "+1 (555) 456-7890",
    company: "Green Energy Solutions",
    type: "Follow-up",
    start: new Date(2026, 7, 5, 11, 0),
    end: new Date(2026, 7, 5, 12, 0),
    notes: "They requested more info on pricing and implementation timeline.",
    location: "Phone Call",
    status: "Scheduled",
    priority: "High",
    tags: ["Renewable", "Enterprise"],
    assignedTo: "John Doe",
    recurring: false,
    attachments: 1,
    completion: 40
  },
  {
    id: 4,
    title: "Closing Call - Cloud Solutions",
    lead: "Emily Davis",
    leadEmail: "emily@cloudsolutions.com",
    leadPhone: "+1 (555) 789-0123",
    company: "Cloud Solutions Ltd",
    type: "Closing",
    start: new Date(2026, 7, 6, 9, 0),
    end: new Date(2026, 7, 6, 10, 0),
    notes: "Ready to sign the contract! 🎉 Final review of terms.",
    location: "Microsoft Teams",
    status: "Scheduled",
    priority: "Urgent",
    tags: ["Cloud", "Enterprise"],
    assignedTo: "Sarah Johnson",
    recurring: false,
    attachments: 3,
    completion: 90
  },
  {
    id: 5,
    title: "Product Demo - Digital Innovations",
    lead: "David Kim",
    leadEmail: "david@digital.io",
    leadPhone: "+1 (555) 234-5678",
    company: "Digital Innovations",
    type: "Demo",
    start: new Date(2026, 7, 7, 15, 0),
    end: new Date(2026, 7, 7, 16, 0),
    notes: "They want to see the reporting and analytics features in detail.",
    location: "Video Call (Google Meet)",
    status: "Scheduled",
    priority: "Medium",
    tags: ["AI", "Startup"],
    assignedTo: "John Doe",
    recurring: false,
    attachments: 0,
    completion: 0
  },
  {
    id: 6,
    title: "Weekly Check-in - Alpha Corp",
    lead: "Robert Wilson",
    leadEmail: "robert@alphacorp.com",
    leadPhone: "+1 (555) 345-6789",
    company: "Alpha Corporation",
    type: "Meeting",
    start: new Date(2026, 7, 8, 13, 0),
    end: new Date(2026, 7, 8, 14, 0),
    notes: "Weekly progress review. They're happy with the service.",
    location: "Video Call",
    status: "Scheduled",
    priority: "Medium",
    tags: ["Enterprise", "Ongoing"],
    assignedTo: "Sarah Johnson",
    recurring: true,
    attachments: 0,
    completion: 0
  },
  {
    id: 7,
    title: "Contract Review - GlobalTech",
    lead: "Amanda Lee",
    leadEmail: "amanda@globaltech.com",
    leadPhone: "+1 (555) 567-8901",
    company: "GlobalTech Systems",
    type: "Follow-up",
    start: new Date(2026, 7, 9, 10, 30),
    end: new Date(2026, 7, 9, 11, 30),
    notes: "Review contract terms and negotiate pricing.",
    location: "Phone Call",
    status: "Scheduled",
    priority: "High",
    tags: ["Enterprise", "Legal"],
    assignedTo: "John Doe",
    recurring: false,
    attachments: 4,
    completion: 60
  },
];

// =============== CONSTANTS ===============
const EVENT_TYPES = ['Demo', 'Discovery', 'Follow-up', 'Closing', 'Meeting', 'Call', 'Presentation', 'Workshop'];
const EVENT_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const EVENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];
const TAGS = ['Enterprise', 'SaaS', 'Startup', 'Tech', 'Renewable', 'Cloud', 'AI', 'Legal', 'Ongoing'];

// =============== SIDEBAR ===============
function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Users, label: 'Leads', to: '/leads' },
    { icon: FileText, label: 'Reports', to: '/reports' },
    { icon: Activity, label: 'Activity', to: '/activity' },
    { icon: Target, label: 'Goals', to: '/goals' },
    { icon: CalendarIcon, label: 'Schedule', to: '/schedule' },
    { icon: Settings, label: 'Settings', to: '/settings' },
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
              <UserIcon size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">john@example.com</p>
            </div>
            <button className="text-gray-500 hover:text-white transition">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// =============== EVENT MODAL ===============
function EventModal({ isOpen, onClose, event, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    lead: '',
    leadEmail: '',
    leadPhone: '',
    company: '',
    type: 'Demo',
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    notes: '',
    location: '',
    status: 'Scheduled',
    priority: 'Medium',
    tags: [],
    assignedTo: 'John Doe',
    recurring: false
  });

  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        lead: event.lead || '',
        leadEmail: event.leadEmail || '',
        leadPhone: event.leadPhone || '',
        company: event.company || '',
        type: event.type || 'Demo',
        start: event.start || new Date(),
        end: event.end || new Date(Date.now() + 3600000),
        notes: event.notes || '',
        location: event.location || '',
        status: event.status || 'Scheduled',
        priority: event.priority || 'Medium',
        tags: event.tags || [],
        assignedTo: event.assignedTo || 'John Doe',
        recurring: event.recurring || false
      });
      setSelectedTags(event.tags || []);
    } else {
      const now = new Date();
      const hour = now.getHours();
      const nextHour = new Date(now);
      nextHour.setHours(hour + 1, 0, 0, 0);
      now.setHours(hour, 0, 0, 0);
      
      setFormData({
        title: '',
        lead: '',
        leadEmail: '',
        leadPhone: '',
        company: '',
        type: 'Demo',
        start: now,
        end: nextHour,
        notes: '',
        location: '',
        status: 'Scheduled',
        priority: 'Medium',
        tags: [],
        assignedTo: 'John Doe',
        recurring: false
      });
      setSelectedTags([]);
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, tags: selectedTags });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
      onClose();
    }
  };

  const addTag = (tag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#14141a] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#14141a] border-b border-white/5 p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <div className="flex items-center gap-2">
            {event && (
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-500/10 rounded-lg transition text-red-400 hover:text-red-300"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              placeholder="Enter event title..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lead Name */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Lead Name
              </label>
              <input
                type="text"
                value={formData.lead}
                onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="Lead name..."
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="Company name..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lead Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.leadEmail}
                onChange={(e) => setFormData({ ...formData, leadEmail: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="lead@email.com"
              />
            </div>

            {/* Lead Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Phone
              </label>
              <input
                type="tel"
                value={formData.leadPhone}
                onChange={(e) => setFormData({ ...formData, leadPhone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Event Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type} className="bg-[#14141a]">{type}</option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Assigned To
              </label>
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                <option value="John Doe" className="bg-[#14141a]">John Doe</option>
                <option value="Sarah Johnson" className="bg-[#14141a]">Sarah Johnson</option>
                <option value="Mike Peters" className="bg-[#14141a]">Mike Peters</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Start Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                End Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.end.toISOString().slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value) })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              placeholder="Video call, office, phone, etc."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-white transition"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && tagInput) {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={() => tagInput && addTag(tagInput)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">
              Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"
              placeholder="Add any notes here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                {EVENT_STATUSES.map(status => (
                  <option key={status} value={status} className="bg-[#14141a]">{status}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                {EVENT_PRIORITIES.map(priority => (
                  <option key={priority} value={priority} className="bg-[#14141a]">{priority}</option>
                ))}
              </select>
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                className="w-4 h-4 rounded bg-white/5 border-white/10 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="text-sm text-gray-400">
                Recurring Event
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =============== EVENT DETAILS ===============
function EventDetails({ event, onClose, onEdit, onDelete }) {
  if (!event) return null;

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': 'bg-blue-500/20 text-blue-300 border-blue-500/20',
      'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
      'High': 'bg-orange-500/20 text-orange-300 border-orange-500/20',
      'Urgent': 'bg-red-500/20 text-red-300 border-red-500/20'
    };
    return colors[priority] || colors['Medium'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'Scheduled': 'bg-blue-500/20 text-blue-300 border-blue-500/20',
      'Completed': 'bg-green-500/20 text-green-300 border-green-500/20',
      'Cancelled': 'bg-red-500/20 text-red-300 border-red-500/20',
      'Rescheduled': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20'
    };
    return colors[status] || colors['Scheduled'];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-[#14141a] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/5 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{event.title}</h3>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getPriorityColor(event.priority)}`}>
                {event.priority}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
              {event.recurring && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium border bg-purple-500/20 text-purple-300 border-purple-500/20">
                  <Repeat size={12} className="inline mr-1" />
                  Recurring
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <User size={16} className="text-gray-500" />
            <span className="text-gray-400">Lead:</span>
            <span className="text-white font-medium">{event.lead || 'N/A'}</span>
          </div>

          {event.company && (
            <div className="flex items-center gap-3 text-sm">
              <Building2 size={16} className="text-gray-500" />
              <span className="text-gray-400">Company:</span>
              <span className="text-white">{event.company}</span>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <Mail size={16} className="text-gray-500" />
            <span className="text-gray-400">Email:</span>
            <span className="text-white">{event.leadEmail || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-gray-500" />
            <span className="text-gray-400">Phone:</span>
            <span className="text-white">{event.leadPhone || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-gray-500" />
            <span className="text-gray-400">Time:</span>
            <span className="text-white">
              {event.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
              {' '}
              {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
              {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Tag size={16} className="text-gray-500" />
            <span className="text-gray-400">Type:</span>
            <span className="text-white">{event.type}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <UserIcon size={16} className="text-gray-500" />
            <span className="text-gray-400">Assigned:</span>
            <span className="text-white">{event.assignedTo}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-gray-500" />
              <span className="text-gray-400">Location:</span>
              <span className="text-white">{event.location}</span>
            </div>
          )}

          {event.tags && event.tags.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <Tag size={16} className="text-gray-500" />
              <span className="text-gray-400">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {event.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.notes && (
            <div className="pt-3 border-t border-white/5">
              <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={14} />
                Notes
              </p>
              <p className="text-sm text-gray-300">{event.notes}</p>
            </div>
          )}

          {event.attachments > 0 && (
            <div className="flex items-center gap-3 text-sm pt-2">
              <Paperclip size={16} className="text-gray-500" />
              <span className="text-gray-400">Attachments:</span>
              <span className="text-white">{event.attachments} files</span>
            </div>
          )}

          {event.completion > 0 && event.status !== 'Completed' && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{event.completion}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all"
                  style={{ width: `${event.completion}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 flex items-center justify-end gap-2">
          <button
            onClick={() => { onEdit(event); onClose(); }}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition flex items-center gap-2"
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button
            onClick={() => { onDelete(event.id); onClose(); }}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition flex items-center gap-2"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// =============== MAIN SCHEDULE PAGE ===============
export function SchedulePage() {
  const navigate = useNavigate();
  const { email, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    return days;
  };

  const getEventsForDay = (date) => {
    return events.filter(event => 
      event.start.getDate() === date.getDate() &&
      event.start.getMonth() === date.getMonth() &&
      event.start.getFullYear() === date.getFullYear()
    );
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Filter events based on search and filters
  const getFilteredEvents = () => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.lead.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesPriority = filterPriority === 'all' || event.priority === filterPriority;
      return matchesSearch && matchesType && matchesPriority;
    });
  };

  const handleCreateEvent = (eventData) => {
    const newEvent = {
      id: Math.max(...events.map(e => e.id), 0) + 1,
      ...eventData,
      start: new Date(eventData.start),
      end: new Date(eventData.end),
      attachments: 0,
      completion: 0,
      createdAt: new Date()
    };
    setEvents([...events, newEvent]);
  };

  const handleUpdateEvent = (eventData) => {
    setEvents(events.map(e => 
      e.id === eventData.id 
        ? { ...eventData, start: new Date(eventData.start), end: new Date(eventData.end) }
        : e
    ));
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const openDetails = (event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  // Get stats
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.start > new Date() && e.status !== 'Cancelled').length;
  const completedEvents = events.filter(e => e.status === 'Completed').length;
  const urgentEvents = events.filter(e => e.priority === 'Urgent').length;

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
                <h1 className="text-2xl font-bold text-white">Schedule</h1>
                <p className="text-sm text-gray-500">Manage your calendar and events</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0f0f16]"></span>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total Events</p>
                  <p className="text-2xl font-bold text-white">{totalEvents}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition">
                  <CalendarIcon size={18} className="text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Upcoming</p>
                  <p className="text-2xl font-bold text-white">{upcomingEvents}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition">
                  <Clock8 size={18} className="text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-white">{completedEvents}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition">
                  <CheckCircle size={18} className="text-purple-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Urgent</p>
                  <p className="text-2xl font-bold text-white">{urgentEvents}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Controls */}
          <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPrevious}
                className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-white min-w-[200px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={goToNext}
                className="p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-sm transition"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition w-40 md:w-48"
                />
              </div>

              {/* Filters */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                <option value="all" className="bg-[#14141a]">All Types</option>
                {EVENT_TYPES.map(type => (
                  <option key={type} value={type} className="bg-[#14141a]">{type}</option>
                ))}
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
              >
                <option value="all" className="bg-[#14141a]">All Priorities</option>
                {EVENT_PRIORITIES.map(priority => (
                  <option key={priority} value={priority} className="bg-[#14141a]">{priority}</option>
                ))}
              </select>

              <div className="flex bg-white/5 rounded-xl p-1">
                {['month', 'week', 'day'].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${
                      view === v
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <button
                onClick={openCreateModal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                <Plus size={18} />
                New Event
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[#14141a] rounded-2xl border border-white/5 p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map(({ date, isCurrentMonth }, idx) => {
                const dayEvents = getEventsForDay(date);
                const isTodayDate = isToday(date);
                
                return (
                  <div
                    key={idx}
                    className={`
                      min-h-[100px] p-1.5 rounded-xl transition cursor-pointer
                      ${isCurrentMonth ? 'bg-white/5' : 'bg-white/2 opacity-40'}
                      ${isTodayDate ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#14141a]' : ''}
                      hover:bg-white/10
                    `}
                    onClick={() => {
                      const now = new Date();
                      const start = new Date(date);
                      start.setHours(now.getHours(), 0, 0, 0);
                      const end = new Date(start);
                      end.setHours(start.getHours() + 1);
                      
                      setEditingEvent({
                        title: '',
                        lead: '',
                        leadEmail: '',
                        leadPhone: '',
                        company: '',
                        type: 'Demo',
                        start: start,
                        end: end,
                        notes: '',
                        location: '',
                        status: 'Scheduled',
                        priority: 'Medium',
                        tags: [],
                        assignedTo: 'John Doe',
                        recurring: false
                      });
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      {date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetails(event);
                          }}
                          className={`
                            text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer transition hover:scale-105
                            ${event.priority === 'Urgent' ? 'bg-red-500/20 text-red-300 border-l-2 border-red-500' :
                              event.priority === 'High' ? 'bg-orange-500/20 text-orange-300 border-l-2 border-orange-500' :
                              event.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border-l-2 border-yellow-500' :
                              'bg-blue-500/20 text-blue-300 border-l-2 border-blue-500'}
                          `}
                        >
                          {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-gray-500 pl-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events List */}
          <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Upcoming Events</h3>
                <p className="text-xs text-gray-500">Next 7 days</p>
              </div>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition">
                View All →
              </button>
            </div>
            <div className="space-y-2">
              {getFilteredEvents()
                .filter(e => e.start > new Date() && e.status !== 'Cancelled')
                .sort((a, b) => a.start - b.start)
                .slice(0, 5)
                .map(event => (
                  <div
                    key={event.id}
                    onClick={() => openDetails(event)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-1 h-10 rounded-full ${
                        event.priority === 'Urgent' ? 'bg-red-500' :
                        event.priority === 'High' ? 'bg-orange-500' :
                        event.priority === 'Medium' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{event.title}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{event.lead}</span>
                          <span>•</span>
                          <span>{event.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span>•</span>
                          <span>{event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        event.priority === 'Urgent' ? 'border-red-500/30 text-red-400' :
                        event.priority === 'High' ? 'border-orange-500/30 text-orange-400' :
                        event.priority === 'Medium' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-blue-500/30 text-blue-400'
                      }`}>
                        {event.priority}
                      </span>
                      <span className="text-xs text-gray-500">{event.type}</span>
                    </div>
                  </div>
                ))}
              {getFilteredEvents().filter(e => e.start > new Date() && e.status !== 'Cancelled').length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <CalendarIcon size={20} className="text-gray-500" />
                  </div>
                  <p className="text-gray-500 text-sm">No upcoming events</p>
                  <button
                    onClick={openCreateModal}
                    className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition"
                  >
                    Create your first event →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={editingEvent}
        onSave={editingEvent?.id ? handleUpdateEvent : handleCreateEvent}
        onDelete={handleDeleteEvent}
      />

      <EventDetails
        event={selectedEvent}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={openEditModal}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}