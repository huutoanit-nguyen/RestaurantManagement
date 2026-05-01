import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, X, Loader2, Search } from 'lucide-react';

type Category = 'Món chính' | 'Khai vị' | 'Đồ uống' | 'Tráng miệng';

interface Dish {
  id: number;
  name: string;
  category: Category;
  price: number;
}

interface ApiError {
  message: string;
}

const CATEGORIES: Category[] = ['Món chính', 'Khai vị', 'Đồ uống', 'Tráng miệng'];
const EMPTY_FORM = { name: '', category: 'Món chính' as Category, price: '' };
const BASE_URL = '/api/menu-items';

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

const api = {
  getAll:  (category?: string) =>
    apiFetch<Dish[]>(category ? `?category=${encodeURIComponent(category)}` : ''),
  create:  (body: Omit<Dish, 'id'>) =>
    apiFetch<Dish>('', { method: 'POST', body: JSON.stringify(body) }),
  update:  (id: number, body: Omit<Dish, 'id'>) =>
    apiFetch<Dish>(`/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove:  (id: number) =>
    apiFetch<void>(`/${id}`, { method: 'DELETE' }),
};

// ─── Component ────────────────────────────────────────────────────────────────
const MenuPage: React.FC = () => {
  const [dishes, setDishes]               = useState<Dish[]>([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState<string | null>(null);
  const [search, setSearch]               = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [editTarget, setEditTarget]       = useState<Dish | null>(null);
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [formError, setFormError]         = useState<string | null>(null);
  const [saving, setSaving]               = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<Dish | null>(null);
  const [deleting, setDeleting]           = useState(false);

  // ── Fetch on mount ──
  const loadDishes = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await api.getAll();
      setDishes(data);
    } catch (e: any) {
      setFetchError(e.message ?? 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDishes(); }, [loadDishes]);

  // ── Derived state ──
  const filtered = dishes.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = CATEGORIES.reduce<Record<Category, Dish[]>>((acc, cat) => {
    acc[cat] = filtered.filter(d => d.category === cat);
    return acc;
  }, {} as Record<Category, Dish[]>);

  // ── Modal helpers ──
  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (dish: Dish) => {
    setEditTarget(dish);
    setForm({ name: dish.name, category: dish.category, price: String(dish.price) });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // ── Save (create / update) ──
  const handleSave = async () => {
    if (!form.name.trim())  { setFormError('Vui lòng nhập tên món'); return; }
    const price = Number(form.price);
    if (!form.price || isNaN(price) || price <= 0) { setFormError('Giá không hợp lệ'); return; }

    setSaving(true);
    setFormError(null);
    try {
      const payload = { name: form.name.trim(), category: form.category, price };
      if (editTarget) {
        const updated = await api.update(editTarget.id, payload);
        setDishes(prev => prev.map(d => d.id === updated.id ? updated : d));
      } else {
        const created = await api.create(payload);
        setDishes(prev => [...prev, created]);
      }
      setShowModal(false);
    } catch (e: any) {
      setFormError(e.message ?? 'Lưu thất bại, thử lại');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.remove(deleteTarget.id);
      setDishes(prev => prev.filter(d => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      // bubble lên toast nếu có, tạm thời alert
      alert(e.message ?? 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 p-4 md:p-6 font-[ui-sans-serif,system-ui,sans-serif]  bg-[#FAF7F2] border-l border-gray-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Thực đơn</h2>
          <p className="text-gray-400 text-sm">Quản lý danh sách món ăn nhà hàng</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#8C6F56] text-white rounded-xl text-sm font-medium hover:bg-[#735a44] transition-all shadow-sm"
        >
          <Plus size={16} />
          Thêm món
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm món ăn..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#8C6F56] transition"
        />
      </div>

      {/* Loading / Error states */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-10 justify-center">
          <Loader2 size={16} className="animate-spin" /> Đang tải thực đơn...
        </div>
      )}

      {!loading && fetchError && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <span>{fetchError}</span>
          <button onClick={loadDishes} className="text-xs underline ml-4">Thử lại</button>
        </div>
      )}

      {/* Menu grouped by category */}
      {!loading && !fetchError && (
        <div className="space-y-8">
          {CATEGORIES.map(cat => {
            const rows = grouped[cat];
            if (rows.length === 0 && search) return null;
            return (
              <div key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#8C6F56] rounded-full" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{cat}</h3>
                  <span className="text-xs text-gray-400">({rows.length})</span>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className="grid grid-cols-[1fr_150px_120px_100px] px-5 py-3 border-b border-gray-50 bg-gray-50/30">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Tên món</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase text-center">Danh mục</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Giá tiền</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase text-right">Thao tác</span>
                  </div>

                  {rows.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-300 text-sm italic">
                      Không tìm thấy món nào
                    </div>
                  ) : (
                    rows.map((dish, idx) => (
                      <div
                        key={dish.id}
                        className={`grid grid-cols-[1fr_150px_120px_100px] px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors ${idx < rows.length - 1 ? 'border-b border-gray-50' : ''}`}
                      >
                        <span className="text-sm font-medium text-gray-700">{dish.name}</span>
                        <span className="text-xs text-gray-500 text-center bg-gray-100 py-1 rounded-full">{dish.category}</span>
                        <span className="text-sm text-gray-600 font-semibold">{dish.price.toLocaleString()}đ</span>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(dish)} className="p-1.5 text-gray-400 hover:text-[#8C6F56] transition"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteTarget(dish)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-800">{editTarget ? 'Sửa món ăn' : 'Thêm món mới'}</h3>
              <X size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" onClick={closeModal} />
            </div>
            <div className="space-y-4">
              <input
                type="text" placeholder="Tên món" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-[#8C6F56] outline-none"
              />
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="number" placeholder="Giá tiền (VNĐ)" value={form.price} min={0}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
              />
              {formError && <p className="text-red-500 text-xs px-1">{formError}</p>}
            </div>
            <button
              onClick={handleSave} disabled={saving}
              className="w-full mt-6 py-3 bg-[#8C6F56] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {editTarget ? 'Cập nhật' : 'Thêm vào thực đơn'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xác nhận xoá</h3>
            <p className="text-sm text-gray-500 mb-6">
              Bạn có chắc muốn xoá <span className="font-semibold text-gray-700">{deleteTarget.name}</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                Huỷ
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition flex items-center justify-center gap-2">
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;