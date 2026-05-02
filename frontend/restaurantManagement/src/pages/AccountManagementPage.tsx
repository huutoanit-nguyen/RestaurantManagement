import React, { useState, useEffect } from 'react';
import { Search, KeyRound, Eye, EyeOff, Loader2, Users, CheckCircle2, X, ShieldAlert } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'Quản lý' | 'Phục vụ' | 'Thu ngân' | 'Bếp' | 'Bảo vệ';

interface Staff {
  id: number;
  fullName: string;
  role: Role;
  shift: string;
  username?: string; // có thể chưa có tài khoản
}

interface SetAccountForm {
  username: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: SetAccountForm = { username: '', password: '', confirmPassword: '' };
const BASE_URL = '/api/staff';

// ─── Auth check ───────────────────────────────────────────────────────────────
function isManager(): boolean {
  const role = localStorage.getItem('userRole') ?? '';
  return role.trim().toLowerCase() === 'quản lý' || role.trim() === 'Quản lý';
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

const api = {
  getAll: () => apiFetch<Staff[]>(BASE_URL),
  setAccount: (id: number, username: string, password: string) =>
    apiFetch<Staff>(`${BASE_URL}/${id}/account`, {
      method: 'PUT',
      body: JSON.stringify({ username, password }),
    }),
  removeAccount: (id: number) =>
    apiFetch<void>(`${BASE_URL}/${id}/account`, { method: 'DELETE' }),
};

// ─── Role badge ───────────────────────────────────────────────────────────────
const ROLE_COLOR: Record<string, string> = {
  'Quản lý':  'bg-amber-100 text-amber-700',
  'Phục vụ':  'bg-blue-100 text-blue-600',
  'Thu ngân': 'bg-green-100 text-green-700',
  'Bếp':      'bg-orange-100 text-orange-600',
  'Bảo vệ':   'bg-gray-100 text-gray-600',
};

// ─── Component ────────────────────────────────────────────────────────────────
const AccountManagementPage: React.FC = () => {
  const [staff, setStaff]           = useState<Staff[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch]         = useState('');

  const [target, setTarget]         = useState<Staff | null>(null);
  const [form, setForm]             = useState<SetAccountForm>(EMPTY_FORM);
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formError, setFormError]   = useState<string | null>(null);
  const [saving, setSaving]         = useState(false);
  const [successId, setSuccessId]   = useState<number | null>(null);

  const [removeTarget, setRemoveTarget] = useState<Staff | null>(null);
  const [removing, setRemoving]         = useState(false);

  // Chặn non-manager
  if (!isManager()) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white gap-4">
        <ShieldAlert size={40} className="text-gray-300" />
        <p className="text-gray-400 text-sm">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  const loadStaff = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await api.getAll();
      setStaff(data);
    } catch (e: any) {
      setFetchError(e.message ?? 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  const filtered = staff.filter(s =>
    (s.fullName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // ── Mở modal set tài khoản ──
  const openSetAccount = (s: Staff) => {
    setTarget(s);
    setForm({ username: s.username ?? '', password: '', confirmPassword: '' });
    setFormError(null);
    setShowPass(false);
    setShowConfirm(false);
  };

  // ── Lưu tài khoản ──
  const handleSave = async () => {
    if (!form.username.trim())    { setFormError('Vui lòng nhập tên đăng nhập'); return; }
    if (form.username.includes(' ')) { setFormError('Tên đăng nhập không được có khoảng trắng'); return; }
    if (!form.password)           { setFormError('Vui lòng nhập mật khẩu'); return; }
    if (form.password.length < 6) { setFormError('Mật khẩu tối thiểu 6 ký tự'); return; }
    if (form.password !== form.confirmPassword) { setFormError('Mật khẩu xác nhận không khớp'); return; }
    if (!target) return;

    setSaving(true);
    setFormError(null);
    try {
      const updated = await api.setAccount(target.id, form.username.trim(), form.password);
      setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
      setTarget(null);
      setSuccessId(target.id);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (e: any) {
      setFormError(e.message ?? 'Lưu thất bại, thử lại');
    } finally {
      setSaving(false);
    }
  };

  // ── Xoá tài khoản ──
  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await api.removeAccount(removeTarget.id);
      setStaff(prev => prev.map(s => s.id === removeTarget.id ? { ...s, username: undefined } : s));
      setRemoveTarget(null);
    } catch (e: any) {
      alert(e.message ?? 'Xoá tài khoản thất bại');
    } finally {
      setRemoving(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 p-4 md:p-8 font-[ui-sans-serif,system-ui,sans-serif] h-full bg-white border-l border-gray-200 overflow-y-auto">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý tài khoản</h2>
        <p className="text-gray-400 text-sm mt-1">Thiết lập tài khoản đăng nhập cho nhân viên</p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm nhân viên..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-[#FAF7F2] text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F56] focus:bg-white transition"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Đang tải...
        </div>
      )}

      {/* Error */}
      {!loading && fetchError && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span>{fetchError}</span>
          <button onClick={loadStaff} className="text-xs underline ml-4">Thử lại</button>
        </div>
      )}

      {/* Table */}
      {!loading && !fetchError && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-[2fr_1fr_1fr_140px] px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nhân viên</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vai trò</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tài khoản</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Thao tác</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-300 text-sm italic">Không tìm thấy nhân viên nào</div>
          ) : (
            filtered.map((s, idx) => (
              <div
                key={s.id}
                className={`grid grid-cols-[2fr_1fr_1fr_140px] px-5 py-3.5 items-center hover:bg-[#FAF7F2] transition-colors ${idx < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                {/* Tên */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0E8DF] flex items-center justify-center flex-shrink-0">
                    <Users size={15} className="text-[#8C6F56]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{s.fullName}</p>
                    <p className="text-xs text-gray-400">{s.shift}</p>
                  </div>
                </div>

                {/* Role */}
                <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${ROLE_COLOR[s.role] ?? 'bg-gray-100 text-gray-500'}`}>
                  {s.role}
                </span>

                {/* Trạng thái tài khoản */}
                <div className="flex items-center gap-1.5">
                  {s.username ? (
                    <>
                      <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 font-mono">{s.username}</span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-300 italic">Chưa có</span>
                  )}
                  {successId === s.id && (
                    <span className="text-xs text-green-500 font-medium ml-1">✓ Đã lưu</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openSetAccount(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#8C6F56] bg-[#F0E8DF] hover:bg-[#e8ddd4] rounded-lg transition"
                  >
                    <KeyRound size={12} />
                    {s.username ? 'Đổi' : 'Tạo'}
                  </button>
                  {s.username && (
                    <button
                      onClick={() => setRemoveTarget(s)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Xoá tài khoản"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Modal set tài khoản ── */}
      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={() => setTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">

            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {target.username ? 'Đổi tài khoản' : 'Tạo tài khoản'}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">cho {target.fullName}</p>
              </div>
              <button onClick={() => setTarget(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tên đăng nhập</label>
                <input
                  type="text"
                  placeholder="VD: nguyenvana"
                  value={form.username}
                  autoComplete="off"
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition font-mono"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    autoComplete="new-password"
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirmPassword}
                    autoComplete="new-password"
                    onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-11 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {formError && (
                <p className="text-red-500 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-6 py-3 bg-[#8C6F56] text-white rounded-xl font-bold text-sm hover:bg-[#735a44] transition flex justify-center items-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {target.username ? 'Cập nhật tài khoản' : 'Tạo tài khoản'}
            </button>
          </div>
        </div>
      )}

      {/* ── Modal xác nhận xoá tài khoản ── */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={() => setRemoveTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-800">Xoá tài khoản</h3>
              <button onClick={() => setRemoveTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Xoá tài khoản <span className="font-mono font-semibold text-gray-700">@{removeTarget.username}</span> của{' '}
              <span className="font-semibold text-gray-700">{removeTarget.fullName}</span>?
              Nhân viên này sẽ không thể đăng nhập nữa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Huỷ
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {removing && <Loader2 size={14} className="animate-spin" />}
                Xoá tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagementPage;