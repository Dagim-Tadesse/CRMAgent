/* eslint-disable */
// pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppearance } from '../context/AppearanceContext';
import AppSidebar from '../components/AppSidebar';
import { getLeads, registerUser, changePassword, getTeamUsers, deleteTeamUser, getMyProfile, updateMyProfile } from '../api/apiClient';
import {
  Users,
  User,
  Mail,
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
  Calendar as CalendarIcon
} from 'lucide-react';

// =============== HELPERS ===============
function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private mode errors
  }
}

function loadJsonArray(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function leadsToCsv(leads) {
  if (!Array.isArray(leads) || leads.length === 0) {
    return 'id,name,email,company,status,phone\n';
  }
  const keys = Object.keys(leads[0]);
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = leads.map((row) => keys.map((k) => escape(row[k])).join(','));
  return [keys.join(','), ...rows].join('\n');
}

function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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

const DEFAULT_PROFILE = {
  name: '',
  email: '',
  phone: '',
  title: '',
  bio: '',
  role: ''
};

const DEFAULT_NOTIFICATIONS = {
  email: true,
  push: true,
  desktop: false,
  sms: false,
  leadUpdates: true,
  taskReminders: true,
  systemAlerts: true,
  marketing: false
};

const DEFAULT_PREFERENCES = {
  language: 'English (US)',
  timezone: 'UTC-08:00',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  startOfWeek: 'Monday',
  defaultView: 'Month'
};

const DEFAULT_INTEGRATIONS = {
  slack: true,
  google: true,
  zoom: false,
  outlook: false,
  hubspot: true,
  salesforce: false
};

/** Matches ASP.NET Identity rules in Program.cs (RequiredLength = 6). */
const MIN_PASSWORD_LENGTH = 6;

function validatePasswordPair(password, confirmPassword) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return '';
}

function apiErrorMessage(err, fallback) {
  const data = err?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (Array.isArray(data)) {
    return data.map((e) => e.description || e.Description || String(e)).filter(Boolean).join(' ') || fallback;
  }
  return err?.message || fallback;
}

const accentGradientStyle = {
  background: 'linear-gradient(to right, var(--accent-color), var(--accent-color-dark))'
};

const accentSoftBg = { background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)' };
const accentSoftBorder = { borderColor: 'color-mix(in srgb, var(--accent-color) 20%, transparent)' };
const accentSoftText = { color: 'var(--accent-color)' };

function Toggle({ on, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative w-10 h-5 rounded-full transition-colors"
      style={{ background: on ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)' }}
    >
      <div
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// =============== APPEARANCE SECTION ===============
function AppearanceSection() {
  const {
    theme, setTheme,
    accentColor, setAccentColor,
    fontSize, setFontSize,
    sidebarCollapsed, setSidebarCollapsed,
    animations, setAnimations,
    resetAppearance
  } = useAppearance();

  const [savedFlash, setSavedFlash] = useState(false);

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

  const handleSaveConfirm = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const selectedBorder = {
    borderColor: 'var(--accent-color)',
    background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)'
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Appearance</h3>
            <p className="text-sm text-gray-500">Customize how the app looks and feels</p>
          </div>
          <Palette size={20} style={{ color: 'var(--accent-color)' }} />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Theme</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {themes.map((t) => {
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selected ? '' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  style={selected ? selectedBorder : undefined}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <t.icon
                      size={24}
                      style={selected ? { color: 'var(--accent-color)' } : undefined}
                      className={selected ? '' : 'text-gray-400'}
                    />
                    <div>
                      <p className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-400'}`}>
                        {t.label}
                      </p>
                      <p className="text-xs text-gray-500">{t.description}</p>
                    </div>
                  </div>
                  {selected && (
                    <div className="w-full h-0.5 rounded-full" style={accentGradientStyle} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Accent Color</label>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setAccentColor(color.id)}
                className="group relative"
                title={color.label}
              >
                <div
                  className={`w-10 h-10 rounded-full transition-all duration-200 ${
                    accentColor === color.id
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-[#14141a] scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.color }}
                />
                {accentColor === color.id && (
                  <CheckCircle size={14} className="absolute -top-1 -right-1 text-white bg-[#14141a] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Font Size</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fontSizes.map((size) => {
              const selected = fontSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setFontSize(size.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    selected ? '' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                  style={selected ? selectedBorder : undefined}
                >
                  <p className={`font-medium ${selected ? 'text-white' : 'text-gray-400'}`}>
                    {size.label}
                  </p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: size.size }}>
                    {size.preview}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Collapsed Sidebar</p>
                <p className="text-xs text-gray-500">Minimize sidebar for more space</p>
              </div>
              <Toggle
                on={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Animations</p>
                <p className="text-xs text-gray-500">Enable smooth transitions</p>
              </div>
              <Toggle
                on={animations}
                onToggle={() => setAnimations(!animations)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-400 mb-3">Live Preview</label>
          <div
            className={`p-6 rounded-2xl border border-white/10 bg-white/5 ${
              animations ? 'transition-all duration-300' : 'transition-none'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{
                  ...accentGradientStyle,
                  boxShadow: '0 10px 15px -3px var(--accent-color-shadow)'
                }}
              >
                <User size={24} className="text-white" />
              </div>
              <div>
                <p
                  className="font-semibold text-white"
                  style={{
                    fontSize: fontSize === 'small' ? '14px' : fontSize === 'large' ? '18px' : '16px'
                  }}
                >
                  John Doe
                </p>
                <p className="text-sm" style={{ color: 'var(--accent-color)' }}>Sales Manager</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: '12', label: 'Leads' },
                { value: '5', label: 'Meetings' },
                { value: '85%', label: 'Conversion' }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-3 rounded-xl border"
                  style={{ ...accentSoftBg, ...accentSoftBorder }}
                >
                  <p className="text-sm font-medium" style={accentSoftText}>{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-end gap-3">
          {savedFlash && (
            <span className="text-sm text-green-400 flex items-center gap-1.5">
              <CheckCircle size={16} />
              Appearance applied
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveConfirm}
            className="px-6 py-2.5 rounded-xl text-white font-medium transition-all flex items-center gap-2 hover:opacity-90"
            style={{
              ...accentGradientStyle,
              boxShadow: '0 10px 15px -3px var(--accent-color-shadow)'
            }}
          >
            <Save size={18} />
            Save Appearance
          </button>
        </div>
      </div>

      <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Reset to Defaults</h4>
            <p className="text-xs text-gray-500">Restore all appearance settings to default</p>
          </div>
          <button
            type="button"
            onClick={() => resetAppearance()}
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
function ProfileSection({ authEmail, authRole, onNameChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [formData, setFormData] = useState(DEFAULT_PROFILE);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getMyProfile();
        const data = res?.data || {};
        const next = {
          name: data.name || '',
          email: data.email || authEmail || '',
          phone: data.phone || '',
          title: '',
          bio: '',
          role: data.displayRole || data.role || authRole || ''
        };
        // Keep optional local-only fields (title/bio) if present
        try {
          const local = JSON.parse(localStorage.getItem('settings_profile') || '{}');
          if (local.title) next.title = local.title;
          if (local.bio) next.bio = local.bio;
        } catch { /* ignore */ }
        if (!cancelled) {
          setProfile(next);
          setFormData(next);
          if (next.name && onNameChange) onNameChange(next.name);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError(apiErrorMessage(err, 'Failed to load profile from the server.'));
          const fallback = {
            ...DEFAULT_PROFILE,
            email: authEmail || '',
            role: authRole || ''
          };
          setProfile(fallback);
          setFormData(fallback);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authEmail, authRole, onNameChange]);

  const handleSave = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await updateMyProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });
      const data = res?.data || {};
      const next = {
        ...formData,
        name: data.name || formData.name,
        email: data.email || formData.email,
        phone: data.phone || formData.phone || '',
        role: data.displayRole || data.role || formData.role
      };
      setProfile(next);
      setFormData(next);
      // Persist non-Identity extras locally only
      saveJson('settings_profile', { title: next.title, bio: next.bio });
      if (onNameChange) onNameChange(next.name);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, 'Failed to save profile.'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
        <p className="text-sm text-gray-500">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Profile Information</h3>
          <p className="text-sm text-gray-500">Update your personal information</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-400 flex items-center gap-1.5">
              <CheckCircle size={16} />
              Saved
            </span>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className="px-4 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            style={{
              ...accentSoftBg,
              color: 'var(--accent-color)'
            }}
          >
            {isEditing ? <Save size={16} /> : <Edit2 size={16} />}
            {isEditing ? (busy ? 'Saving…' : 'Save Changes') : 'Edit Profile'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex items-center gap-6 mb-6">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg"
            style={{
              ...accentGradientStyle,
              boxShadow: '0 10px 15px -3px var(--accent-color-shadow)'
            }}
          >
            {profile.name ? profile.name[0].toUpperCase() : '?'}
          </div>
          {isEditing && (
            <button
              type="button"
              className="absolute bottom-0 right-0 p-1.5 rounded-full text-white hover:opacity-90 transition"
              style={{ background: 'var(--accent-color)' }}
            >
              <Edit2 size={14} />
            </button>
          )}
        </div>
        <div>
          <h4 className="text-xl font-semibold text-white">{profile.name || '—'}</h4>
          <p className="text-gray-400">{profile.email}</p>
          {profile.phone ? <p className="text-sm text-gray-400">{profile.phone}</p> : null}
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
              isEditing ? 'focus:ring-1' : 'opacity-70'
            }`}
            style={isEditing ? { '--tw-ring-color': 'var(--accent-color)' } : undefined}
            onFocus={(e) => {
              if (isEditing) e.target.style.borderColor = 'var(--accent-color)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '';
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition opacity-70"
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
              isEditing ? '' : 'opacity-70'
            }`}
            onFocus={(e) => {
              if (isEditing) e.target.style.borderColor = 'var(--accent-color)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '';
            }}
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
              isEditing ? '' : 'opacity-70'
            }`}
            onFocus={(e) => {
              if (isEditing) e.target.style.borderColor = 'var(--accent-color)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '';
            }}
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
              isEditing ? '' : 'opacity-70'
            }`}
            placeholder="Tell us about yourself..."
            onFocus={(e) => {
              if (isEditing) e.target.style.borderColor = 'var(--accent-color)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '';
            }}
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
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    const matchError = validatePasswordPair(
      passwordData.newPassword,
      passwordData.confirmPassword
    );
    if (matchError) {
      setPasswordError(matchError);
      return;
    }

    setPasswordBusy(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setPasswordError(apiErrorMessage(err, 'Failed to update password.'));
    } finally {
      setPasswordBusy(false);
    }
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Security & Authentication</h3>
          <p className="text-sm text-gray-500">Manage your security settings</p>
        </div>
        <Shield size={20} style={{ color: 'var(--accent-color)' }} />
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition pr-10"
                placeholder="Enter current password"
                required
                autoComplete="current-password"
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent-color)'; }}
                onBlur={(e) => { e.target.style.borderColor = ''; }}
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
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition pr-10"
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
                  required
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete="new-password"
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent-color)'; }}
                  onBlur={(e) => { e.target.style.borderColor = ''; }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Confirm Password</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none transition"
                placeholder="Confirm new password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
                onFocus={(e) => { e.target.style.borderColor = 'var(--accent-color)'; }}
                onBlur={(e) => { e.target.style.borderColor = ''; }}
              />
            </div>
          </div>
          {passwordError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
              {passwordError}
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={passwordBusy}
              className="px-6 py-2.5 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                ...accentGradientStyle,
                boxShadow: '0 10px 15px -3px var(--accent-color-shadow)'
              }}
            >
              {passwordBusy ? 'Updating…' : 'Update Password'}
            </button>
            {passwordSaved && (
              <span className="text-sm text-green-400 flex items-center gap-1.5">
                <CheckCircle size={16} />
                Password updated
              </span>
            )}
          </div>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Two-Factor Authentication</h4>
            <p className="text-xs text-gray-500">Add an extra layer of security</p>
          </div>
          <button
            type="button"
            onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
            className="relative w-12 h-6 rounded-full transition-colors"
            style={{ background: twoFactorEnabled ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)' }}
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
              <Fingerprint size={18} style={{ color: 'var(--accent-color)' }} />
              <span>2FA is enabled. You'll need to verify your identity when logging in.</span>
            </div>
            <button
              type="button"
              className="mt-3 text-xs hover:opacity-80 transition"
              style={{ color: 'var(--accent-color)' }}
            >
              Configure 2FA Settings →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// =============== NOTIFICATIONS SECTION ===============
function NotificationsSection() {
  const [notifications, setNotifications] = useState(() =>
    loadJson('settings_notifications', DEFAULT_NOTIFICATIONS)
  );
  const [flash, setFlash] = useState(false);

  const toggleNotification = (key) => {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    saveJson('settings_notifications', next);
    setFlash(true);
    setTimeout(() => setFlash(false), 1200);
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <p className="text-sm text-gray-500">Configure how you receive alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {flash && <span className="text-xs text-green-400">Saved</span>}
          <Bell size={20} style={{ color: 'var(--accent-color)' }} />
        </div>
      </div>

      <div className="mb-6 pb-6 border-b border-white/5">
        <h4 className="text-sm font-medium text-white mb-3">Notification Channels</h4>
        <div className="space-y-3">
          {Object.entries(notifications)
            .filter(([key]) => ['email', 'push', 'desktop', 'sms'].includes(key))
            .map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()} Notifications
                  </p>
                  <p className="text-xs text-gray-500">Receive {key} notifications</p>
                </div>
                <Toggle on={value} onToggle={() => toggleNotification(key)} />
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
                  <p className="text-sm text-white capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Get notified about {key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}
                  </p>
                </div>
                <Toggle on={value} onToggle={() => toggleNotification(key)} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// =============== INTEGRATIONS SECTION ===============
function IntegrationsSection() {
  const [connected, setConnected] = useState(() =>
    loadJson('settings_integrations', DEFAULT_INTEGRATIONS)
  );

  const integrations = [
    { id: 'slack', name: 'Slack', icon: MessageSquare, color: 'bg-[#4A154B]' },
    { id: 'google', name: 'Google Calendar', icon: CalendarIcon, color: 'bg-[#4285F4]' },
    { id: 'zoom', name: 'Zoom', icon: Video, color: 'bg-[#2D8CFF]' },
    { id: 'outlook', name: 'Outlook', icon: Mail, color: 'bg-[#0078D4]' },
    { id: 'hubspot', name: 'HubSpot', icon: Link2, color: 'bg-[#FF7A59]' },
    { id: 'salesforce', name: 'Salesforce', icon: Cloud, color: 'bg-[#00A1E0]' }
  ];

  const toggleIntegration = (id) => {
    const next = { ...connected, [id]: !connected[id] };
    setConnected(next);
    saveJson('settings_integrations', next);
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Integrations</h3>
          <p className="text-sm text-gray-500">Connect your favorite tools</p>
        </div>
        <Link2 size={20} style={{ color: 'var(--accent-color)' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map((integration) => {
          const isConnected = !!connected[integration.id];
          return (
            <div
              key={integration.id}
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center`}>
                  <integration.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{integration.name}</p>
                  <p className={`text-xs ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleIntegration(integration.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                style={
                  isConnected
                    ? { background: 'rgba(34,197,94,0.1)', color: '#4ade80' }
                    : {
                        background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                        color: 'var(--accent-color)'
                      }
                }
              >
                {isConnected ? 'Configure' : 'Connect'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============== PREFERENCES SECTION ===============
function PreferencesSection() {
  const [preferences, setPreferences] = useState(() =>
    loadJson('settings_preferences', DEFAULT_PREFERENCES)
  );

  const updatePreference = (key, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    saveJson('settings_preferences', next);
  };

  const selectFocus = (e) => {
    e.target.style.borderColor = 'var(--accent-color)';
  };
  const selectBlur = (e) => {
    e.target.style.borderColor = '';
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Preferences</h3>
          <p className="text-sm text-gray-500">Customize your experience</p>
        </div>
        <Sliders size={20} style={{ color: 'var(--accent-color)' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Language</label>
          <select
            value={preferences.language}
            onChange={(e) => updatePreference('language', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none transition"
            onFocus={selectFocus}
            onBlur={selectBlur}
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang} className="bg-[#14141a]">{lang}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Timezone</label>
          <select
            value={preferences.timezone}
            onChange={(e) => updatePreference('timezone', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none transition"
            onFocus={selectFocus}
            onBlur={selectBlur}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz} className="bg-[#14141a]">{tz}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Currency</label>
          <select
            value={preferences.currency}
            onChange={(e) => updatePreference('currency', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none transition"
            onFocus={selectFocus}
            onBlur={selectBlur}
          >
            {CURRENCIES.map((curr) => (
              <option key={curr} value={curr} className="bg-[#14141a]">{curr}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Date Format</label>
          <select
            value={preferences.dateFormat}
            onChange={(e) => updatePreference('dateFormat', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none transition"
            onFocus={selectFocus}
            onBlur={selectBlur}
          >
            <option value="MM/DD/YYYY" className="bg-[#14141a]">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY" className="bg-[#14141a]">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD" className="bg-[#14141a]">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Start of Week</label>
          <select
            value={preferences.startOfWeek}
            onChange={(e) => updatePreference('startOfWeek', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none transition"
            onFocus={selectFocus}
            onBlur={selectBlur}
          >
            <option value="Monday" className="bg-[#14141a]">Monday</option>
            <option value="Sunday" className="bg-[#14141a]">Sunday</option>
            <option value="Saturday" className="bg-[#14141a]">Saturday</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Default View</label>
          <select
            value={preferences.defaultView}
            onChange={(e) => updatePreference('defaultView', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none transition"
            onFocus={selectFocus}
            onBlur={selectBlur}
          >
            <option value="Month" className="bg-[#14141a]">Month</option>
            <option value="Week" className="bg-[#14141a]">Week</option>
            <option value="Day" className="bg-[#14141a]">Day</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// =============== TEAM SECTION ===============
function TeamSection() {
  const { role: authRole } = useAuth();
  const canManageTeam = authRole === 'Admin';
  const canInviteAdmins = authRole === 'Admin';
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Sales Rep',
    password: '',
    confirmPassword: ''
  });
  const [showInvitePassword, setShowInvitePassword] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [listError, setListError] = useState('');

  const loadMembers = async () => {
    setListError('');
    try {
      const res = await getTeamUsers();
      const list = Array.isArray(res?.data) ? res.data : [];
      setMembers(list);
    } catch (err) {
      console.error(err);
      setListError(apiErrorMessage(err, 'Failed to load team members from the server.'));
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');

    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setInviteError('Name and email are required.');
      return;
    }

    const pwdError = validatePasswordPair(inviteForm.password, inviteForm.confirmPassword);
    if (pwdError) {
      setInviteError(pwdError);
      return;
    }

    setInviteBusy(true);
    try {
      const res = await registerUser({
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
        phone: inviteForm.phone.trim(),
        password: inviteForm.password,
        role: inviteForm.role
      });

      const created = res?.data;
      setInviteSuccess(created?.message || 'Member invited successfully.');
      setInviteForm({
        name: '',
        email: '',
        phone: '',
        role: 'Sales Rep',
        password: '',
        confirmPassword: ''
      });
      setShowInvite(false);
      await loadMembers();
      setTimeout(() => setInviteSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setInviteError(apiErrorMessage(err, 'Failed to invite member.'));
    } finally {
      setInviteBusy(false);
    }
  };

  const removeMember = async (id) => {
    setListError('');
    try {
      await deleteTeamUser(id);
      await loadMembers();
    } catch (err) {
      console.error(err);
      setListError(apiErrorMessage(err, 'Failed to remove member.'));
    }
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Team Members</h3>
          <p className="text-sm text-gray-500">Manage accounts stored in the database</p>
        </div>
        <button
          type="button"
          disabled={!canManageTeam}
          onClick={() => {
            if (!canManageTeam) return;
            setShowInvite((v) => !v);
            setInviteError('');
          }}
          className="px-4 py-2 rounded-xl text-white font-medium transition-all flex items-center gap-2 text-sm hover:opacity-90 disabled:opacity-50"
          style={{
            ...accentGradientStyle,
            boxShadow: '0 10px 15px -3px var(--accent-color-shadow)'
          }}
          title={canManageTeam ? undefined : 'Only Admins can invite members'}
        >
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      {!canManageTeam && (
        <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm rounded-xl px-4 py-3">
          Viewing team directory only. Only Admins can invite new members.
        </div>
      )}

      {inviteSuccess && (
        <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-300 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle size={16} />
          {inviteSuccess}
        </div>
      )}

      {listError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
          {listError}
        </div>
      )}

      {showInvite && canManageTeam && (
        <form
          onSubmit={handleInvite}
          className="mb-4 p-4 rounded-xl bg-white/5 border border-white/5 space-y-3"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none"
              required
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={inviteForm.phone}
              onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none"
            />
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none"
            >
              <option value="Sales Rep" className="bg-[#14141a]">Sales Rep</option>
              <option value="Manager" className="bg-[#14141a]">Manager</option>
              {canInviteAdmins && (
                <option value="Admin" className="bg-[#14141a]">Admin</option>
              )}
              <option value="Social Media Rep" className="bg-[#14141a]">Social Media Rep</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type={showInvitePassword ? 'text' : 'password'}
                placeholder={`Password (min ${MIN_PASSWORD_LENGTH} chars)`}
                value={inviteForm.password}
                onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none pr-10"
                required
                minLength={MIN_PASSWORD_LENGTH}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowInvitePassword(!showInvitePassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showInvitePassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <input
              type={showInvitePassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={inviteForm.confirmPassword}
              onChange={(e) => setInviteForm({ ...inviteForm, confirmPassword: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none"
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
            />
          </div>
          {inviteError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3">
              {inviteError}
            </div>
          )}
          <button
            type="submit"
            disabled={inviteBusy}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            style={accentGradientStyle}
          >
            {inviteBusy ? 'Creating…' : 'Add Member'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500 py-6 text-center">Loading team…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-gray-500 py-6 text-center">No team members found. Invite someone to get started.</p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={accentGradientStyle}
                >
                  {member.avatar || '??'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.email}</p>
                  {member.phone ? (
                    <p className="text-xs text-gray-600">{member.phone}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                  {member.role}
                </span>
                {member.role !== 'Admin' && (
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============== DATA & EXPORT SECTION ===============
function DataSection() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [exportState, setExportState] = useState('idle'); // idle | loading | success
  const [syncState, setSyncState] = useState('idle');
  const [deleteState, setDeleteState] = useState('idle');

  const handleExport = async () => {
    setExportState('loading');
    try {
      const res = await getLeads();
      const leads = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      downloadCsv('leads-export.csv', leadsToCsv(leads));
      setExportState('success');
    } catch (err) {
      console.error(err);
      setExportState('idle');
    }
    setTimeout(() => setExportState('idle'), 2000);
  };

  const handleSync = () => {
    setSyncState('loading');
    setTimeout(() => {
      setSyncState('success');
      setTimeout(() => setSyncState('idle'), 2000);
    }, 1200);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    setDeleteState('loading');
    setTimeout(() => {
      setDeleteState('success');
      setTimeout(() => setDeleteState('idle'), 2500);
    }, 1000);
  };

  return (
    <div className="bg-[#14141a] rounded-2xl border border-white/5 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Data & Export</h3>
          <p className="text-sm text-gray-500">Manage your data</p>
        </div>
        <Database size={20} style={{ color: 'var(--accent-color)' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleExport}
          disabled={exportState === 'loading'}
          className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition text-left group"
        >
          {exportState === 'loading' ? (
            <RefreshCw size={20} className="mb-2 animate-spin" style={{ color: 'var(--accent-color)' }} />
          ) : exportState === 'success' ? (
            <CheckCircle size={20} className="text-green-400 mb-2" />
          ) : (
            <Download size={20} className="mb-2 group-hover:scale-110 transition" style={{ color: 'var(--accent-color)' }} />
          )}
          <p className="text-sm font-medium text-white">
            {exportState === 'loading' ? 'Exporting…' : exportState === 'success' ? 'Exported!' : 'Export Data'}
          </p>
          <p className="text-xs text-gray-500">Export all your data as CSV</p>
        </button>

        <button
          type="button"
          onClick={handleSync}
          disabled={syncState === 'loading'}
          className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition text-left group"
        >
          {syncState === 'loading' ? (
            <RefreshCw size={20} className="text-green-400 mb-2 animate-spin" />
          ) : syncState === 'success' ? (
            <CheckCircle size={20} className="text-green-400 mb-2" />
          ) : (
            <RefreshCw size={20} className="text-green-400 mb-2 group-hover:rotate-180 transition duration-500" />
          )}
          <p className="text-sm font-medium text-white">
            {syncState === 'loading' ? 'Syncing…' : syncState === 'success' ? 'Synced' : 'Sync Data'}
          </p>
          <p className="text-xs text-gray-500">Sync with all connected services</p>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-red-500/20 transition text-left group"
        >
          <LogOut size={20} className="text-red-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-medium text-white">Log Out</p>
          <p className="text-xs text-gray-500">Sign out of your account</p>
        </button>

        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleteState === 'loading'}
          className="p-4 rounded-xl bg-white/5 border border-red-500/10 hover:border-red-500/30 transition text-left group"
        >
          {deleteState === 'loading' ? (
            <RefreshCw size={20} className="text-red-400 mb-2 animate-spin" />
          ) : deleteState === 'success' ? (
            <CheckCircle size={20} className="text-red-400 mb-2" />
          ) : (
            <Trash2 size={20} className="text-red-400 mb-2 group-hover:scale-110 transition" />
          )}
          <p className="text-sm font-medium text-white">
            {deleteState === 'loading'
              ? 'Deleting…'
              : deleteState === 'success'
                ? 'Account deletion requested (mock)'
                : 'Delete Account'}
          </p>
          <p className="text-xs text-gray-500">Permanently delete your account</p>
        </button>
      </div>
    </div>
  );
}

// =============== MAIN SETTINGS PAGE ===============
export function SettingsPage() {
  const { email, role, name, setDisplayName } = useAuth();
  const { theme, sidebarCollapsed } = useAppearance();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

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
        return (
          <ProfileSection
            authEmail={email}
            authRole={role}
            onNameChange={setDisplayName}
          />
        );
      case 'security':
        return <SecuritySection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'integrations':
        return <IntegrationsSection />;
      case 'preferences':
        return <PreferencesSection />;
      case 'team':
        return <TeamSection />;
      case 'data':
        return <DataSection />;
      default:
        return (
          <ProfileSection
            authEmail={email}
            authRole={role}
            onNameChange={setDisplayName}
          />
        );
    }
  };

  return (
    <div className={`flex min-h-screen bg-[#0a0a0f] ${theme === 'light' ? 'light' : 'dark'}`}>
      <AppSidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`flex-1 min-w-0 ${sidebarCollapsed ? '' : ''}`}>
        <header className="bg-[#0f0f16] border-b border-white/5 sticky top-0 z-30 backdrop-blur-sm bg-opacity-90">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
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
              <button
                type="button"
                className="relative p-2 hover:bg-white/5 rounded-lg transition text-gray-400 hover:text-white"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0f0f16]" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{name || email}</p>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
                <div
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-lg"
                  style={{
                    ...accentGradientStyle,
                    boxShadow: '0 10px 15px -3px var(--accent-color-shadow)'
                  }}
                >
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
                {sections.map((section) => {
                  const active = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active ? 'text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`}
                      style={
                        active
                          ? {
                              background: 'color-mix(in srgb, var(--accent-color) 10%, transparent)',
                              border: '1px solid color-mix(in srgb, var(--accent-color) 20%, transparent)',
                              boxShadow: '0 10px 15px -3px var(--accent-color-shadow)'
                            }
                          : undefined
                      }
                    >
                      <section.icon
                        size={18}
                        style={active ? { color: 'var(--accent-color)' } : undefined}
                      />
                      <span className="text-sm font-medium">{section.label}</span>
                      {active && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: 'var(--accent-color)' }}
                        />
                      )}
                    </button>
                  );
                })}
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
