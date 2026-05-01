import React, { useState } from 'react';
import { Loader2, Eye, EyeOff } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginResponse {
  token: string;
  name: string;
  role: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Đăng nhập thất bại' }));
    throw new Error(err.message || 'Sai tài khoản hoặc mật khẩu');
  }

  return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────
const LoginPage: React.FC = () => {
  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setError('Vui lòng nhập tên đăng nhập'); return; }
    if (!password)        { setError('Vui lòng nhập mật khẩu'); return; }

    setLoading(true);
    setError(null);
    try {
      const data = await login(username.trim(), password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userRole', data.role);
      // Redirect về trang chính sau khi login
      window.location.href = '/';
    } catch (e: any) {
      setError(e.message ?? 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"
      style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#8C6F56]/5" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#8C6F56]/5" />
      </div>

      <div className="relative w-full max-w-sm mx-4">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#8C6F56] mb-4 shadow-lg">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý nhà hàng</h1>
          <p className="text-sm text-gray-400 mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Tên đăng nhập
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(null); }}
                placeholder="nguyenvana"
                autoComplete="username"
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-[#FAF7F2] text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#8C6F56] focus:bg-white transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 bg-[#FAF7F2] text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#8C6F56] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-[#8C6F56] text-white rounded-xl text-sm font-bold hover:bg-[#735a44] transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-300 mt-6">
          Restaurant Management Platform
        </p>
      </div>
    </div>
  );
};

export default LoginPage;