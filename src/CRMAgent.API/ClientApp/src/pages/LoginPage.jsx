import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, ArrowRight, Zap } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { storeLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(email, password);
      storeLogin(res.data.token, res.data.role, res.data.email, res.data.name);
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        setError(`Cannot connect to Backend API. Check your connection or API configuration. (API URL: ${process.env.REACT_APP_API_BASE_URL || 'https://localhost:7001'})`);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Zap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Lead<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Flow</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Smart CRM for modern sales teams</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#14141a] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" 
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 
                             text-white placeholder-gray-500 text-sm
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                             focus:outline-none transition"
                  placeholder="admin@leadflow.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" 
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 
                             text-white placeholder-gray-500 text-sm
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 
                             focus:outline-none transition"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full" />
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                         py-3 rounded-xl text-sm font-semibold
                         hover:shadow-lg hover:shadow-blue-500/25 
                         transition-all duration-200 disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2
                         group"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight 
                    size={18} 
                    className="group-hover:translate-x-1 transition-transform" 
                  />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-600">
            © 2024 LeadFlow. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}