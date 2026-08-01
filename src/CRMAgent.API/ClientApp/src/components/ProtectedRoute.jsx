import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) return <Navigate to='/login' replace />;
  if (allowedRoles && !allowedRoles.includes(role))
    return <div className='p-8 text-red-600 font-medium'>Access denied for role: {role}</div>;
  return children;
}