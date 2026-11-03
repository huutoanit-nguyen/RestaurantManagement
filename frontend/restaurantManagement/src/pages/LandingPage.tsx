import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  LayoutGrid,
  Receipt,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
  Phone,
  Mail,
  Menu,
  X,
  ChefHat,
  UserCog,
  Crown,
  CreditCard,
  ConciergeBell,
  Sparkles,
} from 'lucide-react';
import { session } from '../api/auth';

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = !!session.token;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-gray-800 font-sans selection:bg-[#8C6F56] selection:text-white">
      {/* 1. THANH MENU (STICKY) */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#8C6F56]/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo + Tên App */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-[#8C6F56] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <UtensilsCrossed size={22} />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-[#8C6F56] transition-colors">
                Galadan
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-[#8C6F56] font-semibold -mt-1">
                Quản Lý Nhà Hàng
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-[#8C6F56] transition-colors"
            >
              Tính năng
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-[#8C6F56] transition-colors"
            >
              Cách hoạt động
            </a>
            <a
              href="#roles"
              className="text-sm font-medium text-gray-600 hover:text-[#8C6F56] transition-colors"
            >
              Vai trò
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-gray-600 hover:text-[#8C6F56] transition-colors"
            >
              Liên hệ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to="/app"
                className="px-5 py-2.5 rounded-xl bg-[#8C6F56] text-white text-sm font-semibold hover:bg-[#735a44] shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                Vào ứng dụng <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-[#8C6F56] text-[#8C6F56] text-sm font-semibold hover:bg-[#8C6F56]/10 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 rounded-xl bg-[#8C6F56] text-white text-sm font-semibold hover:bg-[#735a44] shadow-sm hover:shadow transition-all"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-200/50"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-b border-gray-200 px-6 py-5 space-y-4 shadow-xl">
            <nav className="flex flex-col space-y-3">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 hover:text-[#8C6F56]"
              >
                Tính năng
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 hover:text-[#8C6F56]"
              >
                Cách hoạt động
              </a>
              <a
                href="#roles"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 hover:text-[#8C6F56]"
              >
                Vai trò
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 hover:text-[#8C6F56]"
              >
                Liên hệ
              </a>
            </nav>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2.5">
              {isLoggedIn ? (
                <Link
                  to="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#8C6F56] text-white font-semibold"
                >
                  Vào ứng dụng
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-[#8C6F56] text-[#8C6F56] font-semibold"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-[#8C6F56] text-white font-semibold shadow-sm"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Cột trái: Văn bản & Nút */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8C6F56]/10 text-[#8C6F56] text-xs font-semibold tracking-wide">
                <Sparkles size={14} /> Nền tảng quản lý nhà hàng thông minh
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.2]">
                Quản lý nhà hàng gọn gàng,{' '}
                <span className="text-[#8C6F56] relative whitespace-nowrap">
                  ngay trên điện thoại
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Gọi món, thanh toán, theo dõi doanh thu theo thời gian thực. Chủ quán tạo nhà hàng trong 1 phút, nhân viên chỉ cần số điện thoại của chủ để tham gia.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#8C6F56] text-white text-base font-semibold hover:bg-[#735a44] shadow-lg hover:shadow-xl transition-all text-center flex items-center justify-center gap-2 group"
                >
                  Đăng ký miễn phí
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-base font-semibold hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all text-center"
                >
                  Đăng nhập
                </Link>
              </div>

              {/* Thông số nhanh */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-gray-200/60 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl font-bold text-gray-900">1 phút</div>
                  <div className="text-xs text-gray-500 mt-0.5">Khởi tạo quán</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">100%</div>
                  <div className="text-xs text-gray-500 mt-0.5">Realtime tức thì</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">5 Vai trò</div>
                  <div className="text-xs text-gray-500 mt-0.5">Phân quyền chi tiết</div>
                </div>
              </div>
            </div>

            {/* Cột phải: Mockup màn hình quản lý bàn */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-gray-200/80">
                {/* Header mô phỏng thanh điều hướng app */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#8C6F56] text-white flex items-center justify-center text-xs font-bold">
                      G
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-800">Quán Ngon Galadan</div>
                      <div className="text-[10px] text-green-600 font-medium">● 8/12 bàn đang phục vụ</div>
                    </div>
                  </div>
                  <span className="text-[11px] bg-[#8C6F56]/10 text-[#8C6F56] px-2 py-0.5 rounded-full font-semibold">
                    Khu Vực Tầng 1
                  </span>
                </div>

                {/* Sơ đồ bàn demo */}
                <div className="py-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Sơ đồ bàn trực quan
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Bàn 1: Trống */}
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-gray-800 text-sm">Bàn 01</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Bàn trống
                      </span>
                      <p className="text-[11px] text-gray-400 mt-2">4 chỗ ngồi</p>
                    </div>

                    {/* Bàn 2: Có khách */}
                    <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/60 shadow-sm">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-gray-800 text-sm">Bàn 02</span>
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Có khách
                      </span>
                      <div className="mt-2 text-[11px] font-bold text-gray-700 flex justify-between">
                        <span>3 món</span>
                        <span className="text-[#8C6F56]">280.000 đ</span>
                      </div>
                    </div>

                    {/* Bàn 3: Đã đặt */}
                    <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-gray-800 text-sm">Bàn 03</span>
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                        Đã đặt
                      </span>
                      <p className="text-[11px] text-blue-600 mt-2 font-medium">Khách đến 19:30</p>
                    </div>

                    {/* Bàn 4: Bảo trì */}
                    <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-gray-700 text-sm">Bàn 04</span>
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 text-gray-700">
                        Bảo trì
                      </span>
                      <p className="text-[11px] text-gray-400 mt-2">Đang lau dọn</p>
                    </div>
                  </div>
                </div>

                {/* Floating Widget 1: Doanh thu */}
                <div className="mt-2 p-3 bg-gradient-to-r from-[#8C6F56] to-[#735a44] rounded-2xl text-white shadow-md flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-amber-200 font-medium">Doanh thu hôm nay</div>
                    <div className="text-base font-bold">12.450.000 đ</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      +18% so hôm qua
                    </span>
                  </div>
                </div>

                {/* Floating Widget 2: Thông báo Bếp */}
                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                    <ConciergeBell size={15} />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-gray-800">Order mới #14 (Bàn 02)</span>
                    <p className="text-[10px] text-gray-500">2x Bò bít tết sốt tiêu, 1x Nước ép cam</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TÍNH NĂNG (LƯỚI 3 CỘT) */}
      <section id="features" className="py-20 bg-white border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#8C6F56]">
              Tính năng nổi bật
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Mọi thứ bạn cần để vận hành quán trơn tru
            </h2>
            <p className="text-gray-600 text-base">
              Thiết kế trực quan, dễ thao tác trên mọi kích thước màn hình từ điện thoại, máy tính bảng đến máy tính bàn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1. Quản lý bàn */}
            <div className="p-7 rounded-2xl bg-[#FAF7F2] border border-[#8C6F56]/15 hover:border-[#8C6F56]/40 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#8C6F56]/10 text-[#8C6F56] flex items-center justify-center">
                <LayoutGrid size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Quản lý bàn</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Xem trạng thái bàn trống, có khách, đã đặt trước hay bảo trì theo sơ đồ thời gian thực.
              </p>
            </div>

            {/* 2. Gọi món & thanh toán */}
            <div className="p-7 rounded-2xl bg-[#FAF7F2] border border-[#8C6F56]/15 hover:border-[#8C6F56]/40 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#8C6F56]/10 text-[#8C6F56] flex items-center justify-center">
                <Receipt size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Gọi món & thanh toán</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Thêm món vào order đang mở cực nhanh, thu ngân chốt bill chính xác và in hóa đơn tức thì.
              </p>
            </div>

            {/* 3. Menu món ăn */}
            <div className="p-7 rounded-2xl bg-[#FAF7F2] border border-[#8C6F56]/15 hover:border-[#8C6F56]/40 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#8C6F56]/10 text-[#8C6F56] flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Menu thực đơn</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Thêm, sửa, xóa món ăn theo từng danh mục món chính, khai vị, tráng miệng và đồ uống linh hoạt.
              </p>
            </div>

            {/* 4. Báo cáo doanh thu */}
            <div className="p-7 rounded-2xl bg-[#FAF7F2] border border-[#8C6F56]/15 hover:border-[#8C6F56]/40 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#8C6F56]/10 text-[#8C6F56] flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Báo cáo doanh thu</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Thống kê doanh thu hôm nay, so sánh biến động với hôm qua và biểu đồ xu hướng 7 ngày gần nhất.
              </p>
            </div>

            {/* 5. Nhân viên & phân quyền */}
            <div className="p-7 rounded-2xl bg-[#FAF7F2] border border-[#8C6F56]/15 hover:border-[#8C6F56]/40 hover:shadow-lg transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#8C6F56]/10 text-[#8C6F56] flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Nhân viên & phân quyền</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                5 vai trò chuẩn mực: Chủ quán, Quản lý, Phục vụ, Thu ngân và Bếp với quyền hạn rõ ràng.
              </p>
            </div>

            {/* 6. Cập nhật realtime */}
            <div className="p-7 rounded-2xl bg-[#FAF7F2] border border-[#8C6F56]/15 hover:border-[#8C6F56]/40 hover:shadow-lg transition-all space-y-4 relative">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#8C6F56]/10 text-[#8C6F56] flex items-center justify-center">
                  <Zap size={24} />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Sắp có
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Cập nhật realtime</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Bếp thấy order mới ngay khi nhân viên phục vụ gửi yêu cầu thông qua công nghệ WebSocket.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CÁCH HOẠT ĐỘNG (3 BƯỚC) */}
      <section id="how-it-works" className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#8C6F56]">
              Quy trình đơn giản
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Bắt đầu chỉ với 3 bước
            </h2>
            <p className="text-gray-600 text-base">
              Không cần cài đặt phức tạp, không cần thiết bị đắt tiền. Mọi thứ sẵn sàng trong vài phút.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Bước 1 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#8C6F56] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900">Đăng ký tài khoản</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Đăng ký tài khoản cá nhân nhanh chóng bằng số điện thoại di động và mật khẩu bảo mật.
              </p>
            </div>

            {/* Bước 2 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#8C6F56] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900">Tạo hoặc tham gia quán</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chủ quán tạo nhà hàng trong 1 phút, hoặc nhân viên chỉ cần nhập số điện thoại của chủ để xin vào quán.
              </p>
            </div>

            {/* Bước 3 */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative space-y-4 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-[#8C6F56] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900">Duyệt & bắt đầu dùng</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Chủ quán duyệt, gán vai trò cùng ca làm việc thích hợp và cả quán bắt đầu vận hành đồng bộ ngay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VAI TRÒ (5 THẺ) */}
      <section id="roles" className="py-20 bg-white border-t border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-[#8C6F56]">
              Phân quyền thông minh
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              5 vai trò cho mọi vị trí trong nhà hàng
            </h2>
            <p className="text-gray-600 text-base">
              Mỗi nhân sự chỉ thấy và thao tác đúng các chức năng thuộc phạm vi công việc của mình.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Chủ cửa hàng */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#8C6F56]/20 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#8C6F56] text-white flex items-center justify-center mb-4 shadow">
                  <Crown size={20} />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-2">Chủ cửa hàng</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Toàn quyền quản lý nhà hàng, cấu hình chung và bổ nhiệm Quản lý.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#8C6F56]/15 text-[11px] font-semibold text-[#8C6F56]">
                ★ Toàn quyền hệ thống
              </div>
            </div>

            {/* Quản lý */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow">
                  <UserCog size={20} />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-2">Quản lý</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Quản lý danh sách nhân viên, menu thực đơn, cấu hình sơ đồ bàn và theo dõi báo cáo.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] font-semibold text-amber-800">
                Nhân viên • Menu • Báo cáo
              </div>
            </div>

            {/* Phục vụ */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow">
                  <ConciergeBell size={20} />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-2">Phục vụ</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Xem tình trạng bàn, tạo order món cho khách và bổ sung món vào order đang mở.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] font-semibold text-emerald-800">
                Sơ đồ bàn • Tạo order
              </div>
            </div>

            {/* Thu ngân */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4 shadow">
                  <CreditCard size={20} />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-2">Thu ngân</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Kiểm tra order, chốt bill thanh toán, áp dụng chiết khấu và xuất hóa đơn cho khách.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] font-semibold text-blue-800">
                Chốt bill • Thanh toán
              </div>
            </div>

            {/* Bếp */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center mb-4 shadow">
                  <ChefHat size={20} />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-2">Bếp</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Xem danh sách món cần chế biến theo thứ tự gọi món và cập nhật trạng thái ra món.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] font-semibold text-orange-800">
                Tiếp nhận order chế biến
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. KÊU GỌI HÀNH ĐỘNG CUỐI TRANG (CTA) */}
      <section className="py-20 bg-gradient-to-br from-[#8C6F56] to-[#6d543e] text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-base sm:text-lg text-amber-100 max-w-xl mx-auto leading-relaxed">
            Trải nghiệm phương thức quản lý nhà hàng thông minh, tiết kiệm thời gian và nâng cao doanh thu ngay hôm nay.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#8C6F56] font-bold text-base hover:bg-amber-50 shadow-xl transition-all"
            >
              Đăng ký ngay <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer id="contact" className="bg-[#1f1d1b] text-gray-400 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Cột 1: Thông tin thương hiệu */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8C6F56] text-white flex items-center justify-center font-bold">
                  <UtensilsCrossed size={20} />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">Galadan</span>
              </div>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                Giải pháp phần mềm quản lý nhà hàng toàn diện, tối ưu hóa quy trình gọi món, kiểm soát bàn và báo cáo doanh thu theo thời gian thực.
              </p>
            </div>

            {/* Cột 2: Điều hướng */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Điều hướng
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#features" className="hover:text-white transition">Tính năng</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">Cách hoạt động</a></li>
                <li><a href="#roles" className="hover:text-white transition">Phân quyền vai trò</a></li>
                <li><Link to="/login" className="hover:text-white transition">Đăng nhập</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Đăng ký tài khoản</Link></li>
              </ul>
            </div>

            {/* Cột 3: Liên hệ */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Liên hệ hỗ trợ
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2">
                  <Mail size={16} className="text-[#8C6F56]" />
                  <span>support@galadan.vn</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="text-[#8C6F56]" />
                  <span>0901 234 567</span>
                </li>
                <li className="text-xs text-gray-500 pt-2">
                  Hỗ trợ kỹ thuật 24/7 cho chủ nhà hàng
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              © 2026 Galadan. Bản quyền thuộc về Restaurant Management Platform.
            </div>
            <div className="flex gap-6">
              <span className="hover:text-gray-300 cursor-pointer">Điều khoản dịch vụ</span>
              <span className="hover:text-gray-300 cursor-pointer">Chính sách bảo mật</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
