import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi, session } from '../api/auth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      setError('Please enter your phone number');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await authApi.login({ phone: trimmedPhone, password });

      // Save credentials into session
      session.save(data);

      const restaurants = data.restaurants || [];

      if (data.restaurantId != null && data.restaurantId !== 0) {
        navigate('/app', { replace: true });
      } else if (restaurants.length === 0) {
        navigate('/onboarding', { replace: true });
      } else if (restaurants.length >= 2) {
        navigate('/choose-restaurant', { replace: true });
      } else if (restaurants.length === 1) {
        navigate('/choose-restaurant', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err: any) {
      if (err.status === 401) {
        setError('Incorrect phone number or password');
      } else {
        setError(err.message || 'Incorrect phone number or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center justify-center group mb-4">
          <img src="/logo-resmana.png" alt="ResMana" className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
        </Link>
        <h2 className="text-2xl font-extrabold text-[#202923] tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Enter your phone number and password to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl sm:rounded-2xl border border-gray-100">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError(null);
                }}
                placeholder="0901234567"
                autoComplete="tel"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-[#F7F8F5]/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#52735B] focus:bg-white transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm text-gray-800 bg-[#F7F8F5]/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#52735B] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#202923] text-[#C7F4A4] text-sm font-bold hover:bg-[#52735B] hover:text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#52735B] hover:underline">
              Sign up now
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ResMana Restaurant Management © 2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
