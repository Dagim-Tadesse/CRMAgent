import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Person B will send you a message to add 2 more links here:
// { to: '/pipeline', label: 'Pipeline', roles: ['Admin','SalesRep'] }
// { to: '/ai-tasks', label: 'AI Tasks', roles: ['Admin','SalesRep','SocialMediaRep'] }
const links = [
  { to:'/dashboard',     label:'Dashboard',    roles:['Admin','SalesRep','SocialMediaRep','Manager'] },
  { to:'/leads',         label:'Leads',        roles:['Admin','SalesRep','SocialMediaRep','Manager'] },
  { to:'/pipeline',      label:'Pipeline',     roles:['Admin','SalesRep','SocialMediaRep','Manager'] },
  { to:'/ai-tasks',      label:'AI Tasks',     roles:['Admin','SalesRep','SocialMediaRep','Manager'] },
  { to:'/inbound-queue', label:'Inbound Queue',roles:['Admin','SocialMediaRep','Manager'] },
  { to:'/activity',      label:'Activity Log', roles:['Admin','SalesRep','SocialMediaRep','Manager'] },
  { to:'/settings',      label:'Settings',     roles:['Admin','Manager'] },
];

export function Navbar() {
  const { role, email, logout, isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;
  return (
    <aside className='fixed left-0 top-0 h-screen w-64 bg-brand-dark text-white flex flex-col'>
      <div className='p-6 border-b border-blue-800'>
        <h1 className='text-lg font-bold'>CRM Agent</h1>
        <p className='text-xs text-blue-300 mt-1 truncate'>{email}</p>
        <span className='text-xs bg-blue-700 px-2 py-0.5 rounded mt-1 inline-block'>{role}</span>
      </div>
      <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
        {links.filter(l => l.roles.includes(role)).map(l => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800'
              }`}>{l.label}</NavLink>
        ))}
      </nav>
      <div className='p-4 border-t border-blue-800'>
        <button onClick={logout}
          className='w-full text-sm text-blue-300 hover:text-white transition-colors text-left'>
          Sign out
        </button>
      </div>
    </aside>
  );
}