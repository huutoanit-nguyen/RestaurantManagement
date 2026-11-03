import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UtensilsCrossed, Building2, Shield, ArrowRight, Loader2, Plus, LogOut, AlertCircle } from 'lucide-react';
import { authApi, session, type RestaurantItem } from '../api/auth';

export const ChooseRestaurantPage: React.FC = () => {
  const navigate = useNavigate();
  const [restaurants] = useState<RestaurantItem[]>(() => session.restaurants);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (restaurantId: number) => {
    setLoadingId(restaurantId);
    setError(null);

    try {
      const res = await authApi.selectRestaurant(restaurantId);
      // Thay token cũ bằng token mới, lưu restaurantId và role
      session.save({
        ...res,
        restaurantId: res.restaurantId || restaurantId,
      });

      // Điều hướng vào /app
      navigate('/app', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Không thể chọn nhà hàng này. Vui lòng thử lại.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleLogout = () => {
    session.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#8C6F56] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <UtensilsCrossed size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-[#8C6F56] transition-colors">
            Galadan
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Chọn nhà hàng làm việc
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Xin chào <strong className="text-gray-800">{session.fullName || 'bạn'}</strong>, hãy chọn nhà hàng bạn muốn truy cập hôm nay
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl sm:rounded-2xl border border-gray-100">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {restaurants.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-[#8C6F56] mx-auto flex items-center justify-center">
                <Building2 size={32} />
              </div>
              <p className="text-gray-600 text-sm">
                Bạn chưa thuộc nhà hàng nào hoặc danh sách đang trống.
              </p>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8C6F56] text-white text-sm font-semibold hover:bg-[#735a44] transition"
              >
                <Plus size={16} /> Tạo hoặc tham gia nhà hàng
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {restaurants.map((rest) => {
                const isLoading = loadingId === rest.id;
                return (
                  <button
                    key={rest.id}
                    onClick={() => handleSelect(rest.id)}
                    disabled={loadingId !== null}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 bg-[#FAF7F2]/40 hover:bg-[#8C6F56]/5 hover:border-[#8C6F56]/40 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#8C6F56] shadow-sm group-hover:scale-105 group-hover:bg-[#8C6F56] group-hover:text-white transition-all">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-[#8C6F56] transition-colors">
                          {rest.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Shield size={12} className="text-[#8C6F56]" />
                          <span className="text-xs font-medium text-gray-500">
                            {rest.role || 'Thành viên'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin text-[#8C6F56]" />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#8C6F56] group-hover:border-[#8C6F56] transition-all">
                          <ArrowRight size={16} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Hành động phụ: Tạo thêm hoặc Đăng xuất */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
            <Link
              to="/onboarding"
              className="text-[#8C6F56] font-semibold hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Thêm nhà hàng khác
            </Link>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRestaurantPage;

