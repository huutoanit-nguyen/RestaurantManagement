import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Loader2, Users } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role  = 'Quản lý' | 'Phục vụ' | 'Thu ngân' | 'Bếp' | 'Bảo vệ';
type Shift = 'Ca sáng' | 'Ca chiều' | 'Ca tối';

interface Staff {
  id: number;
  fullName: string; // Đã sửa từ name thành fullName để khớp với DB
  role: Role;
  shift: Shift;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES:  Role[]  = ['Quản lý', 'Phục vụ', 'Thu ngân', 'Bếp', 'Bảo vệ'];
const SHIFTS: Shift[] = ['Ca sáng', 'Ca chiều', 'Ca tối'];
const EMPTY_FORM = { fullName: '', role: '' as Role | '', shift: '' as Shift | '' }; // Sửa name -> fullName
const BASE_URL = '/api/staff';

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập hết hạn');
  }

  if (res.status === 403) {
    throw new Error('Bạn không có quyền thực hiện thao tác này');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

const api = {
  getAll:  ()                          => apiFetch<Staff[]>(''),
  create:  (body: Omit<Staff, 'id'>) => apiFetch<Staff>('', { method: 'POST', body: JSON.stringify(body) }),
  remove:  (id: number)               => apiFetch<void>(`/${id}`, { method: 'DELETE' }),
};

// ─── Lấy role hiện tại từ token ──────────────────────────────────────────────
function getCurrentRole(): string | null {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const groups: string[] = payload.groups || [];
    return groups[0] ?? null;
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
const StaffPage: React.FC = () => {
  const [staff, setStaff]               = useState<Staff[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [search, setSearch]             = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState<string | null>(null);
  const [saving, setSaving]             = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const isManager = getCurrentRole() === 'Quản lý';

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

  // Sửa logic filter để an toàn với toLowerCase
  const filtered = staff.filter(s => {
    const nameToSearch = s.fullName || ""; 
    return nameToSearch.toLowerCase().includes(search.toLowerCase());
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.fullName.trim()) { setFormError('Vui lòng nhập tên nhân viên'); return; }
    if (!form.role)        { setFormError('Vui lòng chọn vai trò'); return; }
    if (!form.shift)       { setFormError('Vui lòng chọn ca làm việc'); return; }

    setSaving(true);
    setFormError(null);
    try {
      const created = await api.create({
        fullName:  form.fullName.trim(), // Sửa name -> fullName
        role:  form.role  as Role,
        shift: form.shift as Shift,
      });
      setStaff(prev => [...prev, created]);
      setShowModal(false);
    } catch (e: any) {
      setFormError(e.message ?? 'Thêm thất bại, thử lại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.remove(deleteTarget.id);
      setStaff(prev => prev.filter(s => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      alert(e.message ?? 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 font-[ui-sans-serif,system-ui,sans-serif] h-full bg-white border-l border-gray-200 overflow-y-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý nhân viên</h2>
          <p className="text-gray-400 text-sm mt-1">Danh sách nhân viên nhà hàng</p>
        </div>
        {isManager && (
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-[#8C6F56] text-white rounded-xl text-sm font-medium hover:bg-[#735a44] transition-all shadow-sm">
            <Plus size={15} /> Thêm nhân viên
          </button>
        )}
      </div>

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

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Đang tải danh sách nhân viên...
        </div>
      )}

      {!loading && fetchError && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span>{fetchError}</span>
          <button onClick={loadStaff} className="text-xs underline ml-4">Thử lại</button>
        </div>
      )}

      {!loading && !fetchError && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-[2fr_1fr_1fr_64px] px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              Tên nhân viên
              <span className="bg-[#F0E8DF] text-[#8C6F56] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vai trò</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ca làm việc</span>
            {isManager && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Xoá</span>}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-300 text-sm italic">Không tìm thấy nhân viên nào</div>
          ) : (
            filtered.map((s, idx) => (
              <div key={s.id} className={`grid grid-cols-[2fr_1fr_1fr_64px] px-5 py-3.5 items-center hover:bg-[#FAF7F2] transition-colors ${idx < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0E8DF] flex items-center justify-center flex-shrink-0">
                    <Users size={15} className="text-[#8C6F56]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{s.fullName}</span> {/* Sửa name -> fullName */}
                </div>
                <span className="text-sm text-gray-500">{s.role}</span>
                <span className="text-sm text-gray-700">{s.shift}</span>
                <div className="flex justify-end">
                  {isManager && (
                    <button onClick={() => setDeleteTarget(s)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && isManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800">Thêm nhân viên mới</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Tên nhân viên</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName} // Sửa name -> fullName
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Vai trò</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Ca làm việc</label>
                <select
                  value={form.shift}
                  onChange={e => setForm(f => ({ ...f, shift: e.target.value as Shift }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-[#FAF7F2] focus:bg-white focus:ring-1 focus:ring-[#8C6F56] outline-none transition"
                >
                  <option value="">-- Chọn ca --</option>
                  {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {formError && <p className="text-red-500 text-xs px-1">{formError}</p>}
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full mt-6 py-3 bg-[#8C6F56] text-white rounded-xl font-bold text-sm hover:bg-[#735a44] transition flex justify-center items-center gap-2 disabled:opacity-60">
              {saving && <Loader2 size={15} className="animate-spin" />} Thêm nhân viên
            </button>
          </div>
        </div>
      )}

      {deleteTarget && isManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold text-gray-800">Xác nhận xoá</h3>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Bạn có chắc muốn xoá nhân viên <span className="font-semibold text-gray-700">{deleteTarget.fullName}</span>? {/* Sửa name -> fullName */}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">Huỷ</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60">
                {deleting && <Loader2 size={14} className="animate-spin" />} Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;