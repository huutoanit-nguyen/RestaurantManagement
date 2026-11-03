import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Store,
  UserCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  LogOut,
  Sparkles,
  Phone,
  Info,
} from 'lucide-react';
import { authApi, session } from '../api/auth';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();

  const [restaurantName, setRestaurantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thẻ B: Số điện thoại chủ quán (tham gia nhà hàng - Sắp có)
  const [ownerPhone, setOwnerPhone] = useState('');
  const [showJoinNotice, setShowJoinNotice] = useState(false);

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = restaurantName.trim();
    if (!trimmed) {
      setError('Vui lòng nhập tên nhà hàng của bạn');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await authApi.createRestaurant(trimmed);

      // Lưu token mới, restaurantId và role theo response 201:
      // { "token": "...", "restaurantId": 3, "name": "Quán Ngon", "role": "Chủ cửa hàng" }
      session.save({
        token: res.token,
        restaurantId: res.restaurantId,
        role: res.role || 'Chủ cửa hàng',
        name: res.name || trimmed,
        fullName: res.fullName || session.fullName,
      });

      // Chuyển hướng vào /app
      navigate('/app', { replace: true });
    } catch (err: any) {
      if (err.status === 409) {
        setError('Bạn đã đăng ký nhà hàng rồi');
      } else {
        setError(err.message || 'Không thể tạo nhà hàng. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    session.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8C6F56] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <UtensilsCrossed size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-[#8C6F56] transition-colors">
            Galadan
          </span>
        </Link>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Bắt đầu với Galadan
        </h2>
        <p className="mt-2 text-base text-gray-600 max-w-lg mx-auto">
          Xin chào <strong className="text-gray-900">{session.fullName || 'bạn'}</strong>! Bạn muốn quản lý một nhà hàng mới hay tham gia vào nhà hàng của người khác?
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl px-4 sm:px-0">
        {/* Lỗi cảnh báo */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 shadow-sm">
            <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* THẺ A: "Tôi là chủ quán, tạo nhà hàng" */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border-2 border-[#8C6F56] relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#8C6F56]/10 text-[#8C6F56] flex items-center justify-center">
                  <Store size={24} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8C6F56] text-white flex items-center gap-1 shadow-sm">
                  <Sparkles size={12} /> Khuyên dùng
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tôi là chủ quán, tạo nhà hàng
              </h3>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Tự tạo nhà hàng trong 1 phút. Bạn sẽ có toàn quyền cấu hình sơ đồ bàn, menu, nhân sự và báo cáo doanh thu.
              </p>

              <form onSubmit={handleCreateRestaurant} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tên nhà hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={(e) => {
                      setRestaurantName(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ví dụ: Quán Ngon Galadan"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-[#FAF7F2]/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8C6F56] focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-[#8C6F56] text-white text-sm font-bold hover:bg-[#735a44] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? 'Đang tạo nhà hàng...' : 'Tạo nhà hàng ngay'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
              ✓ Miễn phí khởi tạo • Không giới hạn số lượng bàn
            </div>
          </div>

          {/* THẺ B: "Tôi là nhân viên, tham gia nhà hàng" */}
          <div className="bg-white/80 rounded-2xl p-6 sm:p-7 shadow-lg border border-gray-200 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <UserCheck size={24} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Sắp có
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Tôi là nhân viên, tham gia nhà hàng
              </h3>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                Nhập số điện thoại của chủ quán để gửi yêu cầu tham gia. Sau khi chủ quán duyệt và phân vai trò, bạn có thể bắt đầu làm việc.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Số điện thoại chủ quán
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="0901234567"
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    />
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowJoinNotice(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Tìm & Xin tham gia
                </button>

                {showJoinNotice && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                    <Info size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
                    <span>
                      Tính năng tham gia nhà hàng theo số điện thoại chủ quán đang trong giai đoạn hoàn thiện ở bước tiếp theo. Vui lòng tạo nhà hàng riêng để trải nghiệm trước!
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
              ✓ Kết nối nhanh chóng với chủ quán
            </div>
          </div>
        </div>

        {/* Chân trang Onboarding */}
        <div className="mt-8 text-center flex items-center justify-between px-2 text-xs">
          <Link to="/" className="text-gray-500 hover:text-gray-700">
            ← Quay lại trang chủ
          </Link>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
          >
            <LogOut size={14} /> Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

