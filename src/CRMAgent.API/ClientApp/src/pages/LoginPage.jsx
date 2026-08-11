import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { storeLogin }          = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await login(email, password);
      storeLogin(res.data.token, res.data.role, res.data.email);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError(`Cannot connect to Backend API. Check your connection or API configuration. (API URL: ${process.env.REACT_APP_API_BASE_URL || 'https://localhost:7001'})`);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }
    finally { setLoading(false); }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-brand-light'>
      <div className='bg-white rounded-2xl shadow-lg p-10 w-full max-w-md'>
        <div className='text-center mb-8'>
          <div className='w-12 h-12 bg-brand-dark rounded-xl flex items-center justify-center mx-auto mb-4'>
            <span className='text-white font-bold text-lg'>CRM</span>
          </div>
          <h1 className='text-2xl font-bold text-brand-dark'>CRM Agent</h1>
          <p className='text-gray-500 mt-1 text-sm'>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='text-sm font-medium text-gray-700 block mb-1'>Email</label>
            <input type='email' value={email} onChange={e=>setEmail(e.target.value)}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:ring-2 focus:ring-brand-mid focus:border-transparent outline-none'
              placeholder='admin@crm.com' required />
          </div>
          <div>
            <label className='text-sm font-medium text-gray-700 block mb-1'>Password</label>
            <input type='password' value={password} onChange={e=>setPassword(e.target.value)}
              className='w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:ring-2 focus:ring-brand-mid focus:border-transparent outline-none'
              placeholder='Enter your password' required />
          </div>
          {error && <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg'>{error}</p>}
          <button type='submit' disabled={loading}
            className='w-full bg-brand-dark text-white py-2.5 rounded-lg text-sm font-semibold
                       hover:bg-brand-mid transition-colors disabled:opacity-50'>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}