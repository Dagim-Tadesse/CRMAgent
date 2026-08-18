import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Activity,
  Calendar,
  Settings,
  Zap,
  User,
  Kanban,
  Sparkles
} from 'lucide-react';
import { useAppearance } from '../context/AppearanceContext';
import { useAuth } from '../hooks/useAuth';

const MENU_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Users, label: 'Leads', to: '/leads' },
  { icon: Kanban, label: 'Pipeline', to: '/pipeline' },
  { icon: Sparkles, label: 'AI Tasks', to: '/ai-tasks' },
  { icon: FileText, label: 'Reports', to: '/reports' },
  { icon: Activity, label: 'Activity', to: '/activity' },
  { icon: Calendar, label: 'Calendar', to: '/calendar' },
  { icon: Settings, label: 'Settings', to: '/settings' }
];

/**
 * Shared app sidebar — brand/accent colors come from AppearanceContext.
 */
export default function AppSidebar({ isOpen, toggleSidebar }) {
  const { sidebarCollapsed, accentHex, accentDarkHex } = useAppearance();
  const { email, role } = useAuth();

  let displayName = email || 'User';
  try {
    const raw = localStorage.getItem('settings_profile');
    if (raw) {
      const profile = JSON.parse(raw);
      if (profile?.name) displayName = profile.name;
    }
  } catch { /* ignore */ }

  const accentGradient = {
    background: `linear-gradient(to right, ${accentHex}, ${accentDarkHex})`,
    boxShadow: `0 10px 15px -3px ${accentHex}40`
  };
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-[#0a0a0f] border-r border-white/5
          text-white z-50 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          flex flex-col
        `}
      >
        <div className={`p-6 border-b border-white/5 ${sidebarCollapsed ? 'px-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={accentGradient}
            >
              <Zap size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1
                  className="text-xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${accentHex}, ${accentDarkHex})`,
                    WebkitBackgroundClip: 'text'
                  }}
                >
                  LeadFlow
                </h1>
                <p className="text-xs text-gray-500">Analytics Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 p-4 space-y-1 overflow-y-auto ${sidebarCollapsed ? 'px-2' : ''}`}>
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={toggleSidebar}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${sidebarCollapsed ? 'justify-center px-2' : ''}
                ${isActive
                  ? 'text-white border'
                  : 'text-gray-500 hover:bg-white/5 hover:text-white border border-transparent'}
              `}
              style={({ isActive }) =>
                isActive
                  ? {
                      background: `${accentHex}1f`,
                      borderColor: `${accentHex}40`,
                      boxShadow: `0 10px 15px -3px ${accentHex}40`
                    }
                  : undefined
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    style={isActive ? { color: accentHex } : undefined}
                  />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <span
                          className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: accentHex }}
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`p-4 border-t border-white/5 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div
            className={`flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition ${
              sidebarCollapsed ? 'justify-center px-2' : ''
            }`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={accentGradient}
            >
              <User size={16} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{email || role || '—'}</p>
                </div>
                <NavLink to="/settings" className="text-gray-500 hover:text-white transition">
                  <Settings size={18} />
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
