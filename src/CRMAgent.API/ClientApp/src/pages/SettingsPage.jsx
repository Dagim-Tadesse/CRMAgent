/* eslint-disable */
// pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
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
  User,
  Mail,
  Phone,
  Shield,
  Moon,
  Sun,
  Monitor,
  Palette,
  Bell,
  Link2,
  Cloud,
  Sliders,
  UserPlus,
  Trash2,
  Database,
  Download,
  RefreshCw,
  LogOut,
  Menu,
  Save,
  Edit2,
  Eye,
  EyeOff,
  Fingerprint,
  MessageSquare,
  Video,
  Lock,
  CheckCircle,
  AlertCircle,
  Key,
  Clock,
  Globe,
  Smartphone,
  Star,
  Award,
  Briefcase,
  Building2,
  ChevronRight,
  Plus,
  X,
  Search,
  Filter,
  Kanban,
  Sparkles
} from 'lucide-react';
import { ConfirmModal, AlertModal } from '../components/Modal';

// =============== CONSTANTS ===============
const TIMEZONES = [
  'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00',
  'UTC-07:00', 'UTC-06:00', 'UTC-05:00', 'UTC-04:00', 'UTC-03:00',
  'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 'UTC+02:00',
  'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+06:00', 'UTC+07:00',
  'UTC+08:00', 'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'INR', 'BRL'];

const LANGUAGE_OPTIONS = [
  'English (US)',
  'English (UK)',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Arabic'
];

// =============== SIDEBAR ===============
function Sidebar({ isOpen, toggleSidebar, accentColor, sidebarCollapsed }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: Users, label: 'Leads', to: '/leads' },
    { icon: Kanban, label: 'Pipeline', to: '/pipeline' },
    { icon: Sparkles, label: 'AI Tasks', to: '/ai-tasks' },
    { icon: FileText, label: 'Reports', to: '/reports' },
    { icon: Activity, label: 'Activity', to: '/activity' },
    { icon: CalendarIcon, label: 'Calendar', to: '/calendar' },
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
        fixed lg:sticky top-0 left-0 h-screen bg-[#0a0a0f] border-r border-white/5
        text-white z-50 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        flex flex-col
      `}>
        <div className={`p-6 border-b border-white/5 ${sidebarCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r from-${accentColor}-500 to-${accentColor === 'blue' ? 'purple' : accentColor}-600 flex items-center justify-center shadow-lg shadow-${accentColor}-500/25 flex-shrink-0`}>
              <Zap size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">LeadFlow</h1>
                <p className="text-xs text-gray-500">Analytics Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 p-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : ''}`}>
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.to}
              onClick={toggleSidebar}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${sidebarCollapsed ? 'justify-center px-2' : ''}
                ${isActive
                  ? `bg-${accentColor}-500/10 text-white shadow-lg shadow-${accentColor}-500/10 border border-${accentColor}-500/20` 
                  : 'text-gray-500 hover:bg-white/5 hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={isActive ? `text-${accentColor}-400` : ''} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <span className={`ml-auto w-1.5 h-1.5 rounded-full bg-${accentColor}-400 animate-pulse`} />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`p-4 border-t border-white/5 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition ${sidebarCollapsed ? 'justify-center px-2' : ''}`}>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-r from-${accentColor}-500 to-${accentColor === 'blue' ? 'purple' : accentColor}-600 flex items-center justify-center shadow-lg shadow-${accentColor}-500/25 flex-shrink-0`}>
              <User size={16} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-gray-500 truncate">john@example.com</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button className="text-gray-500 hover:text-white transition">
                <SettingsIcon size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// =============== APPEARANCE SECTION ===============
function AppearanceSection({ 
  theme, setTheme, 
  accentColor, setAccentColor, 
  fontSize, setFontSize,
  sidebarCollapsed, setSidebarCollapsed,
  animations, setAnimations,
  onSave,
  onReset
}) {
  const themes = [
    { id: 'dark', icon: Moon, label: 'Dark', description: 'Easy on the eyes' },
    { id: 'light', icon: Sun, label: 'Light', description: 'Bright and clean' },
    { id: 'system', icon: Monitor, label: 'System', description: 'Follows your OS' }
  ];

  const accentColors = [
    { id: 'blue', color: '#3b82f6', label: 'Blue' },
    { id: 'purple', color: '#8b5cf6', label: 'Purple' },
    { id: 'green', color: '#22c55e', label: 'Green' },
    { id: 'orange', color: '#f59e0b', label: 'Orange' },
    { id: 'red', color: '#ef4444', label: 'Red' },
    { id: 'pink', color: '#ec4899', label: 'Pink' },
    { id: 'teal', color: '#14b8a6', label: 'Teal' },
    { id: 'indigo', color: '#6366f1', label: 'Indigo' }
  ];

  const fontSizes = [
    { id: 'small', label: 'Small', size: '14px', preview: 'Small text preview' },
    { id: 'medium', label: 'Medium', size: '16px', preview: 'Medium text preview' },
    { id: 'large', label: 'Large', size: '18px', preview: 'Large text preview' }
  ];

  const getColorClass = (colorId) => {
    return `bg-${colorId}-500`;
  };

  const getBorderClass = (colorId) => {
    return `border-${colorId}-500`;
  };

  const getTextClass = (colorId) => {
    return `text-${colorId}-400`;
  };

  const getGradientClass = (colorId) => {
    if (colorId === 'blue') return 'from-blue-500 to-purple-600';
    if (colorId === 'purple') return 'from-purple-500 to-pink-600';
    if (colorId === 'green') return 'from-green-500 to-teal-600';
    if (colorId === 'orange') return 'from-orange-500 to-red-600';
    if (colorId === 'red') return 'from-red-500 to-pink-600';
    if (colorId === 'pink') return 'from-pink-500 to-purple-600';
    if (colorId === 'teal') return 'from-teal-500 to-green-600';
    if (colorId === 'indigo') return 'from-indigo-500 to-purple-600';
    return 'from-blue-500 to-purple-600';
  };

  // Apply theme to body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
      document.documentElement.classList.toggle('light', !prefersDark);
    }
  }, [theme]);

  return (
    <div className="space-y-6">
      {/* Main Appearance Card */}
      <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Appearance</h3>
            <p className="text-sm text-gray-500">Customize how the app looks and feels</p>
          </div>
          <Palette size={20} className={`text-${accentColor}-400`} />
        </div>

        {/* Theme Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Theme</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${theme === t.id
                    ? `border-${accentColor}-500 bg-${accentColor}-500/10`
                    : 'border-white/10 bg-white/5 hover:bg-white/10'}
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <t.icon size={24} className={theme === t.id ? `text-${accentColor}-400` : 'text-gray-400'} />
                  <div>
                    <p className={`text-sm font-medium ${theme === t.id ? 'text-white' : 'text-gray-400'}`}>
                      {t.label}
                    </p>
                    <p className="text-xs text-gray-500">{t.description}</p>
                  </div>
                </div>
                {theme === t.id && (
                  <div className={`w-full h-0.5 bg-gradient-to-r ${getGradientClass(accentColor)} rounded-full`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Accent Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Accent Color</label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.id}
                onClick={() => setAccentColor(color.id)}
                className="group relative"
                title={color.label}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full transition-all duration-200
                    ${accentColor === color.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#14141a] scale-110' : 'hover:scale-105'}
                  `}
                  style={{ backgroundColor: color.color }}
                />
                {accentColor === color.id && (
                  <CheckCircle size={14} className="absolute -top-1 -right-1 text-white bg-[#14141a] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Font Size</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setFontSize(size.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-center
                  ${fontSize === size.id
                    ? `border-${accentColor}-500 bg-${accentColor}-500/10`
                    : 'border-white/10 bg-white/5 hover:bg-white/10'}
                `}
              >
                <p className={`font-medium ${fontSize === size.id ? 'text-white' : 'text-gray-400'}`}>
                  {size.label}
                </p>
                <p className="text-gray-500 mt-1" style={{ fontSize: size.size }}>
                  {size.preview}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Collapsed Sidebar</p>
                <p className="text-xs text-gray-500">Minimize sidebar for more space</p>
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`relative w-10 h-5 rounded-full transition-colors ${sidebarCollapsed ? `bg-${accentColor}-500` : 'bg-white/10'}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    sidebarCollapsed ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Animations</p>
                <p className="text-xs text-gray-500">Enable smooth transitions</p>
              </div>
              <button
                onClick={() => setAnimations(!animations)}
                className={`relative w-10 h-5 rounded-full transition-colors ${animations ? `bg-${accentColor}-500` : 'bg-white/10'}`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    animations ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Live Preview</label>
          <div className={`p-6 rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 ${animations ? '' : 'transition-none'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getGradientClass(accentColor)} flex items-center justify-center shadow-lg shadow-${accentColor}-500/25`}>
                <User size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white" style={{ fontSize: fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px' }}>
                  John Doe
                </p>
                <p className={`text-sm text-${accentColor}-400`}>Sales Manager</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl bg-${accentColor}-500/10 border border-${accentColor}-500/20`}>
                <p className={`text-${accentColor}-400 text-sm font-medium`}>12</p>
                <p className="text-xs text-gray-500">Leads</p>
              </div>
              <div className={`p-3 rounded-xl bg-${accentColor}-500/10 border border-${accentColor}-500/20`}>
                <p className={`text-${accentColor}-400 text-sm font-medium`}>5</p>
                <p className="text-xs text-gray-500">Meetings</p>
              </div>
              <div className={`p-3 rounded-xl bg-${accentColor}-500/10 border border-${accentColor}-500/20`}>
                <p className={`text-${accentColor}-400 text-sm font-medium`}>85%</p>
                <p className="text-xs text-gray-500">Conversion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-end">
          <button
            onClick={onSave}
            className={`px-6 py-2.5 rounded-xl bg-gradient-to-r ${getGradientClass(accentColor)} text-white font-medium hover:shadow-lg hover:shadow-${accentColor}-500/25 transition-all flex items-center gap-2`}
          >
            <Save size={18} />
            Save Appearance
          </button>
        </div>
      </div>

      {/* Reset to Defaults */}
      <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Reset to Defaults</h4>
            <p className="text-xs text-gray-500">Restore all appearance settings to default</p>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition text-sm"
          >
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}

// =============== PROFILE SECTION ===============
function ProfileSection({ profile, onUpdate, accentColor, theme }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Profile Information</h3>
          <p className="text-sm text-gray-500">Update your personal information</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-4 py-2 rounded-xl bg-${accentColor}-500/10 hover:bg-${accentColor}-500/20 text-${accentColor}-400 transition flex items-center gap-2`}
        >
          {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div className={`w-24 h-24 rounded-full bg-gradient-to-r from-${accentColor}-500 to-${accentColor === 'blue' ? 'purple' : accentColor}-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-${accentColor}-500/25`}>
            {profile.name ? profile.name[0].toUpperCase() : 'JD'}
          </div>
          {isEditing && (
            <button className={`absolute bottom-0 right-0 p-1.5 rounded-full bg-${accentColor}-500 text-white hover:bg-${accentColor}-600 transition`}>
              <Edit2 size={14} />
            </button>
          )}
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white">{profile.name}</h4>
          <p className="text-gray-400">{profile.email}</p>
          <p className="text-sm text-gray-500">{profile.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition ${
              isEditing ? `focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500` : 'opacity-70'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!isEditing}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition ${
              isEditing ? `focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500` : 'opacity-70'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition ${
              isEditing ? `focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500` : 'opacity-70'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Job Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            disabled={!isEditing}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition ${
              isEditing ? `focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500` : 'opacity-70'
            }`}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!isEditing}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition resize-none ${
              isEditing ? `focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500` : 'opacity-70'
            }`}
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );
}

// =============== SECURITY SECTION ===============
function SecuritySection({ accentColor }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', message: '', variant: 'info' });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setAlertState({ isOpen: true, title: 'Success', message: 'Password updated successfully! (Mock)', variant: 'success' });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <>
      <AlertModal isOpen={alertState.isOpen} onClose={() => setAlertState({ ...alertState, isOpen: false })} title={alertState.title} message={alertState.message} variant={alertState.variant} />
      <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Security & Authentication</h3>
          <p className="text-sm text-gray-500">Manage your security settings</p>
        </div>
        <Shield size={20} className={`text-${accentColor}-400`} />
      </div>

      <div className="mb-6 pb-6 border-b border-white/5">
        <h4 className="text-sm font-medium text-white mb-4">Change Password</h4>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition pr-10`}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">New Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition`}
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition`}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className={`px-6 py-2.5 rounded-xl bg-gradient-to-r from-${accentColor}-500 to-${accentColor === 'blue' ? 'purple' : accentColor}-600 text-white font-medium hover:shadow-lg hover:shadow-${accentColor}-500/25 transition-all`}
          >
            Update Password
          </button>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Two-Factor Authentication</h4>
            <p className="text-xs text-gray-500">Add an extra layer of security</p>
          </div>
          <button
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              twoFactorEnabled ? `bg-${accentColor}-500` : 'bg-white/10'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                twoFactorEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Fingerprint size={18} className={`text-${accentColor}-400`} />
              <span>2FA is enabled. You'll need to verify your identity when logging in.</span>
            </div>
            <button className={`mt-3 text-xs text-${accentColor}-400 hover:text-${accentColor}-300 transition`}>
              Configure 2FA Settings →
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// =============== NOTIFICATIONS SECTION ===============
function NotificationsSection({ accentColor }) {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    sms: false,
    leadUpdates: true,
    taskReminders: true,
    systemAlerts: true,
    marketing: false
  });

  const toggleNotification = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <p className="text-sm text-gray-500">Configure how you receive alerts</p>
        </div>
        <Bell size={20} className={`text-${accentColor}-400`} />
      </div>

      <div className="mb-6 pb-6 border-b border-white/5">
        <h4 className="text-sm font-medium text-white mb-3">Notification Channels</h4>
        <div className="space-y-3">
          {Object.entries(notifications)
            .filter(([key]) => ['email', 'push', 'desktop', 'sms'].includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Notifications</p>
                  <p className="text-xs text-gray-500">Receive {key} notifications</p>
                </div>
                <button
                  onClick={() => toggleNotification(key)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${value ? `bg-${accentColor}-500` : 'bg-white/10'}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white mb-3">Notification Events</h4>
        <div className="space-y-3">
          {Object.entries(notifications)
            .filter(([key]) => !['email', 'push', 'desktop', 'sms'].includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-xs text-gray-500">Get notified about {key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}</p>
                </div>
                <button
                  onClick={() => toggleNotification(key)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${value ? `bg-${accentColor}-500` : 'bg-white/10'}`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      value ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// =============== INTEGRATIONS SECTION ===============
function IntegrationsSection({ accentColor }) {
  const integrations = [
    { id: 'slack', name: 'Slack', icon: MessageSquare, status: 'Connected', color: 'bg-[#4A154B]' },
    { id: 'google', name: 'Google Calendar', icon: CalendarIcon, status: 'Connected', color: 'bg-[#4285F4]' },
    { id: 'zoom', name: 'Zoom', icon: Video, status: 'Disconnected', color: 'bg-[#2D8CFF]' },
    { id: 'outlook', name: 'Outlook', icon: Mail, status: 'Disconnected', color: 'bg-[#0078D4]' },
    { id: 'hubspot', name: 'HubSpot', icon: Link2, status: 'Connected', color: 'bg-[#FF7A59]' },
    { id: 'salesforce', name: 'Salesforce', icon: Cloud, status: 'Disconnected', color: 'bg-[#00A1E0]' }
  ];

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Integrations</h3>
          <p className="text-sm text-gray-500">Connect your favorite tools</p>
        </div>
        <Link2 size={20} className={`text-${accentColor}-400`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map((integration) => (
          <div key={integration.id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center`}>
                <integration.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{integration.name}</p>
                <p className={`text-xs ${integration.status === 'Connected' ? 'text-green-400' : 'text-gray-500'}`}>
                  {integration.status}
                </p>
              </div>
            </div>
            <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              integration.status === 'Connected' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : `bg-${accentColor}-500/10 text-${accentColor}-400 hover:bg-${accentColor}-500/20`
            }`}>
              {integration.status === 'Connected' ? 'Configure' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== PREFERENCES SECTION ===============
function PreferencesSection({ accentColor }) {
  const [preferences, setPreferences] = useState({
    language: 'English (US)',
    timezone: 'UTC-08:00',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    startOfWeek: 'Monday',
    defaultView: 'Month'
  });

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Preferences</h3>
          <p className="text-sm text-gray-500">Customize your experience</p>
        </div>
        <Sliders size={20} className={`text-${accentColor}-400`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Language</label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition`}
          >
            {LANGUAGE_OPTIONS.map(lang => <option key={lang} value={lang} className="bg-[#14141a]">{lang}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition`}
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz} className="bg-[#14141a]">{tz}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Currency</label>
          <select
            value={preferences.currency}
            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition`}
          >
            {CURRENCIES.map(curr => <option key={curr} value={curr} className="bg-[#14141a]">{curr}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Date Format</label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition`}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Start of Week</label>
          <select
            value={preferences.startOfWeek}
            onChange={(e) => setPreferences({ ...preferences, startOfWeek: e.target.value })}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition`}
          >
            <option value="Monday">Monday</option>
            <option value="Sunday">Sunday</option>
            <option value="Saturday">Saturday</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Default View</label>
          <select
            value={preferences.defaultView}
            onChange={(e) => setPreferences({ ...preferences, defaultView: e.target.value })}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-${accentColor}-500 focus:ring-1 focus:ring-${accentColor}-500 outline-none transition`}
          >
            <option value="Month">Month</option>
            <option value="Week">Week</option>
            <option value="Day">Day</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// =============== TEAM SECTION ===============
function TeamSection({ accentColor }) {
  const teamMembers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: 'JD' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Sales Rep', avatar: 'SJ' },
    { id: 3, name: 'Mike Peters', email: 'mike@example.com', role: 'Sales Rep', avatar: 'MP' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'Manager', avatar: 'ED' }
  ];

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Team Members</h3>
          <p className="text-sm text-gray-500">Manage your team</p>
        </div>
        <button className={`px-4 py-2 rounded-xl bg-gradient-to-r from-${accentColor}-500 to-${accentColor === 'blue' ? 'purple' : accentColor}-600 text-white font-medium hover:shadow-lg hover:shadow-${accentColor}-500/25 transition-all flex items-center gap-2 text-sm`}>
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      <div className="space-y-2">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-${accentColor}-500 to-${accentColor === 'blue' ? 'purple' : accentColor}-600 flex items-center justify-center text-sm font-bold text-white`}>
                {member.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                {member.role}
              </span>
              {member.role !== 'Admin' && (
                <button className="text-gray-500 hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============== DATA & EXPORT SECTION ===============
function DataSection({ accentColor }) {
  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Data & Export</h3>
          <p className="text-sm text-gray-500">Manage your data</p>
        </div>
        <Database size={20} className={`text-${accentColor}-400`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition text-left group">
          <Download size={20} className={`text-${accentColor}-400 mb-2 group-hover:scale-110 transition`} />
          <p className="text-sm font-medium text-white">Export Data</p>
          <p className="text-xs text-gray-500">Export all your data as CSV</p>
        </button>

        <button className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition text-left group">
          <RefreshCw size={20} className="text-green-400 mb-2 group-hover:rotate-180 transition duration-500" />
          <p className="text-sm font-medium text-white">Sync Data</p>
          <p className="text-xs text-gray-500">Sync with all connected services</p>
        </button>

        <button className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/20 transition text-left group">
          <LogOut size={20} className="text-red-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-medium text-white">Log Out</p>
          <p className="text-xs text-gray-500">Sign out of your account</p>
        </button>

        <button className="p-4 rounded-xl bg-white/5 border border-red-500/10 hover:border-red-500/30 transition text-left group">
          <Trash2 size={20} className="text-red-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-medium text-white">Delete Account</p>
          <p className="text-xs text-gray-500">Permanently delete your account</p>
        </button>
      </div>
    </div>
  );
}

// =============== MAIN SETTINGS PAGE ===============
export function SettingsPage() {
  const navigate = useNavigate();
  const { email, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Appearance state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('appearance_theme');
    return saved || 'dark';
  });
  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('appearance_accent');
    return saved || 'blue';
  });
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('appearance_fontSize');
    return saved || 'medium';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('appearance_sidebarCollapsed');
    return saved === 'true';
  });
  const [animations, setAnimations] = useState(() => {
    const saved = localStorage.getItem('appearance_animations');
    return saved !== 'false';
  });

  // Alert and Confirm state
  const [alertState, setAlertState] = useState({ isOpen: false, title: '', message: '', variant: 'info' });
  const [confirmState, setConfirmState] = useState({ isOpen: false, onConfirm: null });

  // Profile state
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    title: 'Sales Manager',
    bio: 'Sales professional with 10+ years of experience in B2B SaaS.',
    role: 'Admin'
  });

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setAlertState({ isOpen: true, title: 'Success', message: 'Profile updated successfully! (Mock)', variant: 'success' });
  };

  // Save appearance settings
  const handleSaveAppearance = () => {
    localStorage.setItem('appearance_theme', theme);
    localStorage.setItem('appearance_accent', accentColor);
    localStorage.setItem('appearance_fontSize', fontSize);
    localStorage.setItem('appearance_sidebarCollapsed', String(sidebarCollapsed));
    localStorage.setItem('appearance_animations', String(animations));
    setAlertState({ isOpen: true, title: 'Saved', message: 'Appearance preferences saved! 🎨', variant: 'success' });
  };

  // Reset appearance settings
  const handleResetAppearance = () => {
    setConfirmState({
      isOpen: true,
      onConfirm: () => {
        setTheme('dark');
        setAccentColor('blue');
        setFontSize('medium');
        setSidebarCollapsed(false);
        setAnimations(true);
        localStorage.removeItem('appearance_theme');
        localStorage.removeItem('appearance_accent');
        localStorage.removeItem('appearance_fontSize');
        localStorage.removeItem('appearance_sidebarCollapsed');
        localStorage.removeItem('appearance_animations');
        setAlertState({ isOpen: true, title: 'Reset', message: 'Appearance reset to defaults! 🔄', variant: 'info' });
      }
    });
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'data', label: 'Data & Export', icon: Database }
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection profile={profile} onUpdate={handleProfileUpdate} accentColor={accentColor} theme={theme} />;
      case 'security':
        return <SecuritySection accentColor={accentColor} />;
      case 'appearance':
        return (
          <AppearanceSection 
            theme={theme}
            setTheme={setTheme}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            fontSize={fontSize}
            setFontSize={setFontSize}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            animations={animations}
            setAnimations={setAnimations}
            onSave={handleSaveAppearance}
            onReset={handleResetAppearance}
          />
        );
      case 'notifications':
        return <NotificationsSection accentColor={accentColor} />;
      case 'integrations':
        return <IntegrationsSection accentColor={accentColor} />;
      case 'preferences':
        return <PreferencesSection accentColor={accentColor} />;
      case 'team':
        return <TeamSection accentColor={accentColor} />;
      case 'data':
        return <DataSection accentColor={accentColor} />;
      default:
        return <ProfileSection profile={profile} onUpdate={handleProfileUpdate} accentColor={accentColor} theme={theme} />;
    }
  };

  return (
    <>
      <AlertModal isOpen={alertState.isOpen} onClose={() => setAlertState({ ...alertState, isOpen: false })} title={alertState.title} message={alertState.message} variant={alertState.variant} />
      <ConfirmModal isOpen={confirmState.isOpen} onClose={() => setConfirmState({ isOpen: false, onConfirm: null })} onConfirm={confirmState.onConfirm} title="Reset Appearance" message="Are you sure you want to reset all appearance settings?" isDestructive={true} />
      <div className={`flex min-h-screen bg-[#0a0a0f] ${theme === 'light' ? 'light' : 'dark'}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        accentColor={accentColor}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex-1 min-w-0">
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
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-sm text-gray-500">Manage your account and preferences</p>
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

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <div className="bg-[#14141a] rounded-2xl border border-white/5 p-2 sticky top-24">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${activeSection === section.id
                        ? `bg-${accentColor}-500/10 text-white shadow-lg shadow-${accentColor}-500/10 border border-${accentColor}-500/20`
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <section.icon size={18} className={activeSection === section.id ? `text-${accentColor}-400` : ''} />
                    <span className="text-sm font-medium">{section.label}</span>
                    {activeSection === section.id && (
                      <span className={`ml-auto w-1.5 h-1.5 rounded-full bg-${accentColor}-400 animate-pulse`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-6">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
