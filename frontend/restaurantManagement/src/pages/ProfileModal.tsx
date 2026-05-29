import React, { useState, useEffect } from 'react';
import { X, User, KeyRound, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface StaffProfile {
  id: number;
  fullName: string;
  role: string;
  shift: string;
  username: string;
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Hết phiên');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────
const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const [tab, setTab]               = useState<'info' | 'password'>('info');
  const [profile, setProfile]       = useState<StaffProfile | null>(null);
  const [loading, setLoading]       = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Password form ──
  const [oldPass, setOldPass]           = useState('');
  const [newPass, setNewPass]           = useState('');
  const [confirmPass, setConfirmPass]   = useState('');
  const [showOld, setShowOld]           = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [passError, setPassError]       = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState(false);

  // ── Fetch profile khi mở modal ──
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setFetchError(null);
    apiFetch<StaffProfile>('/api/staff/me')
      .then(setProfile)
      .catch(e => setFetchError(e.message ?? 'Không tải được thông tin'))
      .finally(() => setLoading(false));
  }, [open]);

  // ── Reset khi đóng ──
  const handleClose = () => {
    setTab('info');
    setOldPass(''); setNewPass(''); setConfirmPass('');
    setPassError(null); setSuccess(false);
    onClose();
  };

  // ── Đổi mật khẩu ──
  const handleChangePassword = async () => {
    if (!oldPass)              { setPassError('Vui lòng nhập mật khẩu cũ'); return; }
    if (!newPass)              { setPassError('Vui lòng nhập mật khẩu mới'); return; }
    if (newPass.length < 6)    { setPassError('Mật khẩu mới tối thiểu 6 ký tự'); return; }
    if (newPass !== confirmPass){ setPassError('Mật khẩu xác nhận không khớp'); return; }
    if (oldPass === newPass)   { setPassError('Mật khẩu mới phải khác mật khẩu cũ'); return; }

    setSaving(true);
    setPassError(null);
    try {
      await apiFetch('/api/staff/me/password', {
        method: 'PUT',
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      setSuccess(true);
      setOldPass(''); setNewPass(''); setConfirmPass('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setPassError(e.message ?? 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Thông tin cá nhân</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* Tab */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('info')}
            className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
              tab === 'info'
                ? 'text-[#8C6F56] border-b-2 border-[#8C6F56]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <User size={14} /> Thông tin
          </button>
          <button
            onClick={() => setTab('password')}
            className={`flex-1 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
              tab === 'password'
                ? 'text-[#8C6F56] border-b-2 border-[#8C6F56]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <KeyRound size={14} /> Đổi mật khẩu
          </button>
        </div>

        <div className="px-6 py-5">

          {/* ── Tab Thông tin ── */}
          {tab === 'info' && (
            <>
              {loading && (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </div>
              )}
              {fetchError && (
                <p className="text-red-500 text-sm text-center py-4">{fetchError}</p>
              )}
              {!loading && !fetchError && profile && (
                <div className="space-y-4">
                  {/* Avatar */}
                  <div className="flex flex-col items-center pb-4 border-b border-gray-50">
                    <div className="w-16 h-16 rounded-full bg-[#F0E8DF] flex items-center justify-center mb-3">
                      <User size={28} className="text-[#8C6F56]" />
                    </div>
                    <p className="font-bold text-gray-800">{profile.fullName}</p>
                    <span className={`mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      profile.role === 'Quản lý'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {profile.role}
                    </span>
                  </div>

                  {/* Thông tin chi tiết */}
                  {[
                    { label: 'Tên đăng nhập', value: profile.username, mono: true },
                    { label: 'Ca làm việc',   value: profile.shift },
                    { label: 'Vai trò',        value: profile.role },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-400">{label}</span>
                      <span className={`text-sm font-medium text-gray-700 ${mono ? 'font-mono' : ''}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Tab Đổi mật khẩu ── */}
          {tab === 'password' && (
            <div className="space-y-4">

              {/* Success */}
              {success && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm">
                  <CheckCircle2 size={15} />
                  Đổi mật khẩu thành công!
                </div>
              )}

              {/* Old password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Mật khẩu cũ</label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={oldPass}
                    autoComplete="current-password"
                    onChange={e => { setOldPass(e.target.value); setPassError(null); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition"
                  />
                  <button type="button" onClick={() => setShowOld(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showOld ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    value={newPass}
                    autoComplete="new-password"
                    onChange={e => { setNewPass(e.target.value); setPassError(null); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPass}
                    autoComplete="new-password"
                    onChange={e => { setConfirmPass(e.target.value); setPassError(null); }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {passError && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {passError}
                </p>
              )}

              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="w-full py-3 bg-[#8C6F56] text-white rounded-xl text-sm font-bold hover:bg-[#735a44] transition flex justify-center items-center gap-2 disabled:opacity-60 mt-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;