import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Eye, EyeOff, UtensilsCrossed, AlertCircle } from 'lucide-react';
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
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!password) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await authApi.login({ phone: trimmedPhone, password });

      // Lưu thông tin đăng nhập vào session
      session.save(data);

      // Điều hướng sau đăng nhập theo quy tắc đặc tả:
      // restaurantId != null            → /app (vào thẳng)
      // restaurants.length === 0        → /onboarding
      // restaurants.length >= 2         → /choose-restaurant
      const restaurants = data.restaurants || [];

      if (data.restaurantId != null && data.restaurantId !== 0) {
        navigate('/app', { replace: true });
      } else if (restaurants.length === 0) {
        navigate('/onboarding', { replace: true });
      } else if (restaurants.length >= 2) {
        navigate('/choose-restaurant', { replace: true });
      } else if (restaurants.length === 1) {
        // Có 1 nhà hàng duy nhất nhưng chưa gán active id -> điều hướng choose-restaurant để chọn
        navigate('/choose-restaurant', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err: any) {
      if (err.status === 401) {
        setError('Sai số điện thoại hoặc mật khẩu');
      } else {
        setError(err.message || 'Sai số điện thoại hoặc mật khẩu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8C6F56] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <UtensilsCrossed size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-[#8C6F56] transition-colors">
            Galadan
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Đăng nhập vào hệ thống
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Nhập số điện thoại và mật khẩu để tiếp tục
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl sm:rounded-2xl border border-gray-100">
          {/* Lỗi cảnh báo */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Số điện thoại */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Số điện thoại
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-[#FAF7F2]/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C6F56] focus:bg-white transition"
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Mật khẩu
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
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm text-gray-800 bg-[#FAF7F2]/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C6F56] focus:bg-white transition"
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

            {/* Nút Đăng nhập */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#8C6F56] text-white text-sm font-bold hover:bg-[#735a44] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          {/* Dưới form: Chưa có tài khoản? Đăng ký */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-bold text-[#8C6F56] hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Restaurant Management Platform © 2026
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
