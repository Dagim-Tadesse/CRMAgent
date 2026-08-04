// pages/SettingsPage.jsx
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
  ChevronRight
} from 'lucide-react';

// =============== CONSTANTS ===============
const NOTIFICATION_TYPES = [
  'Email Notifications',
  'Push Notifications',
  'Desktop Notifications',
  'SMS Notifications'
];

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

// =============== PROFILE SECTION ===============
function ProfileSection({ profile, onUpdate }) {
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
          className="px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition flex items-center gap-2"
        >
          {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/25">
            {profile.name ? profile.name[0].toUpperCase() : 'JD'}
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition">
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
              isEditing ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'opacity-70'
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
              isEditing ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'opacity-70'
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
              isEditing ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'opacity-70'
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
              isEditing ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'opacity-70'
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
              isEditing ? 'focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 'opacity-70'
            }`}
            placeholder="Tell us about yourself..."
          />
        </div>
      </div>
    </div>
  );
}

// =============== SECURITY SECTION ===============
function SecuritySection() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handlePasswordChange = (e) => {
    e.preventDefault();
    alert('Password updated successfully! (Mock)');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Security & Authentication</h3>
          <p className="text-sm text-gray-500">Manage your security settings</p>
        </div>
        <Shield size={20} className="text-blue-400" />
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition pr-10"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
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
              twoFactorEnabled ? 'bg-blue-500' : 'bg-white/10'
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
              <Fingerprint size={18} className="text-blue-400" />
              <span>2FA is enabled. You'll need to verify your identity when logging in.</span>
            </div>
            <button className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition">
              Configure 2FA Settings →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============== APPEARANCE SECTION ===============
function AppearanceSection() {
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');
  const [fontSize, setFontSize] = useState('medium');

  const themes = [
    { id: 'dark', icon: Moon, label: 'Dark' },
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'system', icon: Monitor, label: 'System' }
  ];

  const accentColors = ['blue', 'purple', 'green', 'orange', 'red', 'pink'];
  const fontSizes = [
    { id: 'small', label: 'Small' },
    { id: 'medium', label: 'Medium' },
    { id: 'large', label: 'Large' }
  ];

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Appearance</h3>
          <p className="text-sm text-gray-500">Customize how the app looks</p>
        </div>
        <Palette size={20} className="text-blue-400" />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-3">Theme</label>
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex-1 p-4 rounded-xl border transition ${
                theme === t.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <t.icon size={24} className={`mx-auto mb-2 ${theme === t.id ? 'text-blue-400' : 'text-gray-400'}`} />
              <p className={`text-sm font-medium ${theme === t.id ? 'text-white' : 'text-gray-400'}`}>{t.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-400 mb-3">Accent Color</label>
        <div className="flex gap-3 flex-wrap">
          {accentColors.map((color) => (
            <button
              key={color}
              onClick={() => setAccentColor(color)}
              className={`w-10 h-10 rounded-full transition ${
                accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#14141a]' : ''
              }`}
              style={{ backgroundColor: color === 'blue' ? '#3b82f6' :
                                      color === 'purple' ? '#8b5cf6' :
                                      color === 'green' ? '#22c55e' :
                                      color === 'orange' ? '#f59e0b' :
                                      color === 'red' ? '#ef4444' :
                                      '#ec4899' }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-3">Font Size</label>
        <div className="flex gap-3">
          {fontSizes.map((size) => (
            <button
              key={size.id}
              onClick={() => setFontSize(size.id)}
              className={`flex-1 p-3 rounded-xl border transition ${
                fontSize === size.id ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className={`font-medium ${size.id === 'small' ? 'text-sm' : size.id === 'large' ? 'text-xl' : 'text-base'}`}>Aa</span>
              <p className="text-xs mt-1">{size.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== NOTIFICATIONS SECTION ===============
function NotificationsSection() {
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
        <Bell size={20} className="text-blue-400" />
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
                  className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
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
                  className={`relative w-10 h-5 rounded-full transition-colors ${value ? 'bg-blue-500' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// =============== INTEGRATIONS SECTION ===============
function IntegrationsSection() {
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
        <Link2 size={20} className="text-blue-400" />
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
              integration.status === 'Connected' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
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
function PreferencesSection() {
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
        <Sliders size={20} className="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Language</label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          >
            {LANGUAGE_OPTIONS.map(lang => <option key={lang} value={lang} className="bg-[#14141a]">{lang}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          >
            {TIMEZONES.map(tz => <option key={tz} value={tz} className="bg-[#14141a]">{tz}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Currency</label>
          <select
            value={preferences.currency}
            onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          >
            {CURRENCIES.map(curr => <option key={curr} value={curr} className="bg-[#14141a]">{curr}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Date Format</label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
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
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
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
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
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
function TeamSection() {
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
        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center gap-2 text-sm">
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      <div className="space-y-2">
        {teamMembers.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
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
function DataSection() {
  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Data & Export</h3>
          <p className="text-sm text-gray-500">Manage your data</p>
        </div>
        <Database size={20} className="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition text-left group">
          <Download size={20} className="text-blue-400 mb-2 group-hover:scale-110 transition" />
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
    alert('Profile updated successfully! (Mock)');
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
      case 'profile': return <ProfileSection profile={profile} onUpdate={handleProfileUpdate} />;
      case 'security': return <SecuritySection />;
      case 'appearance': return <AppearanceSection />;
      case 'notifications': return <NotificationsSection />;
      case 'integrations': return <IntegrationsSection />;
      case 'preferences': return <PreferencesSection />;
      case 'team': return <TeamSection />;
      case 'data': return <DataSection />;
      default: return <ProfileSection profile={profile} onUpdate={handleProfileUpdate} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
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
                        ? 'bg-white/10 text-white shadow-lg shadow-blue-500/10 border border-white/5'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                    `}
                  >
                    <section.icon size={18} className={activeSection === section.id ? 'text-blue-400' : ''} />
                    <span className="text-sm font-medium">{section.label}</span>
                    {activeSection === section.id && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
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
  );
}