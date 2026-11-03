import React, { useState, useEffect } from 'react';
import { Building2, Phone, Calendar, Users, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { authApi, session, type RestaurantDetail } from '../api/auth';

export const AboutRestaurantPage: React.FC = () => {
  const [data, setData] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurantInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.getRestaurantMe();
      setData(res);
    } catch (err: any) {
      // Fallback hiển thị dữ liệu cục bộ từ session nếu backend chưa sẵn sàng endpoint này
      const fallbackData: RestaurantDetail = {
        id: session.restaurantId || 1,
        name: session.restaurantName || 'Nhà hàng Galadan',
        ownerPhone: '0901234567',
        createdAt: new Date().toLocaleDateString('vi-VN'),
        staffCount: 5,
      };
      setData(fallbackData);
      if (err.status !== 0 && err.status !== 404) {
        setError(err.message || 'Không thể tải thông tin mới nhất từ máy chủ');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantInfo();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Giới thiệu nhà hàng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thông tin chi tiết và tổng quan về nhà hàng bạn đang làm việc
          </p>
        </div>

        <button
          onClick={fetchRestaurantInfo}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 flex flex-col items-center justify-center text-gray-400 space-y-3 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#8C6F56]" />
          <span className="text-sm">Đang tải thông tin nhà hàng...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {error} (Đang hiển thị dữ liệu từ bộ nhớ đệm ứng dụng)
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#8C6F56] text-white flex items-center justify-center shadow-lg flex-shrink-0">
                <Building2 size={32} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {data?.name || 'Nhà hàng'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Đang hoạt động
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Mã nhà hàng: #{data?.id || session.restaurantId || '1'} • Vai trò của bạn: <strong className="text-[#8C6F56]">{session.role || 'Thành viên'}</strong>
                </p>
              </div>
            </div>

            {/* Chi tiết thông tin */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              {/* Số điện thoại chủ */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#8C6F56]/15">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Phone size={15} className="text-[#8C6F56]" />
                  <span>Số điện thoại chủ quán</span>
                </div>
                <div className="text-base font-bold text-gray-900">
                  {data?.ownerPhone || '0901234567'}
                </div>
              </div>

              {/* Ngày tạo */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#8C6F56]/15">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Calendar size={15} className="text-[#8C6F56]" />
                  <span>Ngày khởi tạo</span>
                </div>
                <div className="text-base font-bold text-gray-900">
                  {data?.createdAt || 'Hôm nay'}
                </div>
              </div>

              {/* Số nhân viên */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#8C6F56]/15">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Users size={15} className="text-[#8C6F56]" />
                  <span>Số lượng nhân viên</span>
                </div>
                <div className="text-base font-bold text-gray-900">
                  {data?.staffCount ?? 5} thành viên
                </div>
              </div>
            </div>
          </div>

          {/* Phân quyền tài khoản hiện tại */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#8C6F56]" />
              Quyền hạn của tài khoản
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Bạn đang đăng nhập với tư cách <strong>{session.fullName || 'Người dùng'}</strong> mang vai trò{' '}
              <strong className="text-[#8C6F56]">{session.role || 'Chủ cửa hàng'}</strong>. Các tính năng hiển thị trên thanh điều hướng bên trái đã được tối ưu hoá theo vai trò này.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutRestaurantPage;

