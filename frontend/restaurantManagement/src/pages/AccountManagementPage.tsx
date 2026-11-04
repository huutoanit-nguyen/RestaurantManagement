import React, { useState, useEffect } from 'react';
import {
  KeyRound, Eye, EyeOff, Loader2, CheckCircle2, Shield, Clock,
} from 'lucide-react';
import { api } from '../api/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
interface PasswordLog {
  id: number;
  changedAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
// Trang "Bảo mật": đổi mật khẩu của chính mình + lịch sử đổi mật khẩu
const AccountManagementPage: React.FC = () => {
  // ── Password change form ────────────────────────────────────────────────────
  const [oldPass, setOldPass]         = useState('');
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showOld, setShowOld]         = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConf, setShowConf]       = useState(false);
  const [passError, setPassError]     = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [success, setSuccess]         = useState(false);

  // ── Password logs ───────────────────────────────────────────────────────────
  const [logs, setLogs]               = useState<PasswordLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    api<PasswordLog[]>('/api/staff/password-logs')
      .then(setLogs)
      .catch(() => { /* bỏ qua */ })
      .finally(() => setLogsLoading(false));
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!oldPass)              return 'Vui lòng nhập mật khẩu cũ';
    if (!newPass)              return 'Vui lòng nhập mật khẩu mới';
    if (newPass.length < 6)    return 'Mật khẩu mới phải có ít nhất 6 ký tự';
    if (newPass !== confirmPass) return 'Xác nhận mật khẩu không khớp';
    if (oldPass === newPass)   return 'Mật khẩu mới phải khác mật khẩu cũ';
    return null;
  };

  const handleChange = async () => {
    const err = validate();
    if (err) { setPassError(err); return; }

    setSaving(true);
    setPassError(null);
    try {
      await api('/api/staff/me/password', {
        method: 'PUT',
        body: { oldPassword: oldPass, newPassword: newPass },
      });
      setSuccess(true);
      setOldPass(''); setNewPass(''); setConfirmPass('');
      // Reload logs
      const freshLogs = await api<PasswordLog[]>('/api/staff/password-logs');
      setLogs(freshLogs);
      setTimeout(() => setSuccess(false), 3500);
    } catch (e: any) {
      setPassError(e.message ?? 'Đổi mật khẩu thất bại');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8F5] p-6">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Shield size={22} className="text-[#52735B]" />
          <div>
            <h1 className="text-xl font-bold text-[#202923]">Bảo mật</h1>
            <p className="text-xs text-gray-400">Thay đổi mật khẩu tài khoản của bạn</p>
          </div>
        </div>

        {/* ── Đổi mật khẩu ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <KeyRound size={15} className="text-[#52735B]" />
            Đổi mật khẩu
          </p>

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm">
              <CheckCircle2 size={15} />
              Đổi mật khẩu thành công!
            </div>
          )}

          {/* Mật khẩu cũ */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Mật khẩu cũ</label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                placeholder="••••••••"
                value={oldPass}
                autoComplete="current-password"
                onChange={e => { setOldPass(e.target.value); setPassError(null); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm bg-[#F7F8F5] focus:bg-white focus:ring-1 focus:ring-[#52735B] outline-none transition"
              />
              <button type="button" onClick={() => setShowOld(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Mật khẩu mới */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Mật khẩu mới</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                value={newPass}
                autoComplete="new-password"
                onChange={e => { setNewPass(e.target.value); setPassError(null); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm bg-[#F7F8F5] focus:bg-white focus:ring-1 focus:ring-[#52735B] outline-none transition"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Xác nhận mật khẩu */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Xác nhận mật khẩu mới</label>
            <div className="relative">
              <input
                type={showConf ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPass}
                autoComplete="new-password"
                onChange={e => { setConfirmPass(e.target.value); setPassError(null); }}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm bg-[#F7F8F5] focus:bg-white focus:ring-1 focus:ring-[#52735B] outline-none transition"
              />
              <button type="button" onClick={() => setShowConf(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {passError && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-2">
              {passError}
            </p>
          )}

          <button
            onClick={handleChange}
            disabled={saving}
            className="w-full py-3 bg-[#202923] text-[#C7F4A4] rounded-xl font-bold text-sm hover:bg-[#52735B] hover:text-white transition flex justify-center items-center gap-2 disabled:opacity-60 mt-2 cursor-pointer"
          >
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
          </button>
        </div>

        {/* ── Lịch sử đổi mật khẩu ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <Clock size={15} className="text-[#52735B]" />
            Lịch sử đổi mật khẩu
          </p>

          {logsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-[#52735B]" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Chưa có lịch sử đổi mật khẩu</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {logs.map(log => (
                <div key={log.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-gray-500">Đổi mật khẩu</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(log.changedAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AccountManagementPage;
