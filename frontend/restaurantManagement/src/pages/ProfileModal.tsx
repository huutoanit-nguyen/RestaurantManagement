import React, { useState, useEffect } from 'react';
import { X, User, Loader2 } from 'lucide-react';
import { api, session } from '../api/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StaffProfile {
  membershipId?: number;
  accountId?: number;
  fullName: string;
  phone?: string;
  role: string;
  shift: string;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const [profile, setProfile]       = useState<StaffProfile | null>(null);
  const [loading, setLoading]       = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Fetch profile khi mở modal ──
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setFetchError(null);
    api<StaffProfile>('/api/staff/me')
      .then(setProfile)
      .catch(_e => {
        // Fallback từ session
        setProfile({
          fullName: session.fullName,
          phone: localStorage.getItem('userPhone') || '',
          role: session.role ?? '',
          shift: '',
        });
      })
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Thông tin tài khoản</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="pt-5">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 size={20} className="animate-spin text-[#52735B]" />
              <span className="text-sm font-medium">Đang tải thông tin...</span>
            </div>
          )}

          {fetchError && (
            <p className="text-red-500 text-sm text-center py-6">{fetchError}</p>
          )}

          {!loading && !fetchError && profile && (
            <div className="space-y-5">
              {/* Avatar + Tên + Role */}
              <div className="flex flex-col items-center pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-[#F7F8F5] border border-[#202923]/15 flex items-center justify-center mb-3 shadow-xs">
                  <User size={32} className="text-[#52735B]" />
                </div>
                <p className="text-lg font-bold text-gray-900">{profile.fullName}</p>
                <span className="mt-1.5 text-xs font-bold px-3 py-1 rounded-md bg-[#C7F4A4] text-[#202923]">
                  {profile.role || 'Thành viên'}
                </span>
              </div>

              {/* Chi tiết */}
              <div className="space-y-3">
                {[
                  { label: 'Số điện thoại', value: profile.phone || session.fullName, mono: true },
                  { label: 'Vai trò',        value: profile.role || session.role || 'Thành viên' },
                  { label: 'Ca làm việc',   value: profile.shift || 'Tất cả' },
                  { label: 'Nhà hàng',      value: session.restaurantName || 'ResMana' },
                ].map(({ label, value, mono }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-medium text-gray-500">{label}</span>
                    <span className={`text-base font-bold text-gray-800 ${mono ? 'font-mono' : ''}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Nút Đóng */}
              <button
                onClick={onClose}
                className="w-full mt-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
