import React, { useState, useEffect } from 'react';
import { Users, Plus, Minus, X, ShoppingBag, Loader2, CreditCard, BookMarked, PlusCircle, Trash2 } from 'lucide-react';
import { tableApi } from '../api/tableApi';
import type { RestaurantTable, TableStatus } from '../types/table';

// ─── Kiểu món ăn & giỏ hàng ────────────────────────────────────────────────
interface MenuDish {
  id: number;
  name: string;
  price: number;
}

interface CartItem extends MenuDish {
  quantity: number;
}

// ─── Menu giả lập (thay bằng menuApi sau) ───────────────────────────────────
const MENU_DISHES: MenuDish[] = [
  { id: 101, name: 'Phở Đặc Biệt',   price: 65000 },
  { id: 102, name: 'Bún Chả Hà Nội', price: 55000 },
  { id: 103, name: 'Cà Phê Muối',    price: 35000 },
  { id: 104, name: 'Trà Đào Cam Sả', price: 40000 },
];

// ─── Màu theo trạng thái ────────────────────────────────────────────────────
const STATUS_STYLE: Record<TableStatus, { card: string; badge: string; label: string }> = {
  AVAILABLE:   { card: 'bg-[#E9F5F8] border-[#D1E9F0]', badge: 'bg-green-100 text-green-700',   label: 'Trống'     },
  OCCUPIED:    { card: 'bg-[#FDF5E6] border-[#F3E8D6]', badge: 'bg-red-100 text-red-700',       label: 'Có khách'  },
  RESERVED:    { card: 'bg-[#F0EBF8] border-[#DDD0EE]', badge: 'bg-purple-100 text-purple-700', label: 'Đặt trước' },
  MAINTENANCE: { card: 'bg-gray-100  border-gray-200',  badge: 'bg-gray-200 text-gray-500',     label: 'Bảo trì'   },
};

// ────────────────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  
  const [tables, setTables]               = useState<RestaurantTable[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  // Lưu order đã confirm theo tableId — persist khi đóng/mở lại panel
  const [tableOrders, setTableOrders]     = useState<Record<number, CartItem[]>>({});

  // Món đang thêm mới, chưa confirm
  const [pendingCart, setPendingCart]     = useState<CartItem[]>([]);

  const [confirming, setConfirming]       = useState(false);
  const [paying, setPaying]               = useState(false);
  const [reserving, setReserving]           = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);
  const [deleting, setDeleting]             = useState(false);

  // ── State modal thêm bàn ─────────────────────────────────────────────────
  const [showAddModal, setShowAddModal]     = useState(false);
  const [addForm, setAddForm]               = useState({ tableNumber: '', capacity: '', location: '' });
  const [addError, setAddError]             = useState<string | null>(null);
  const [adding, setAdding]                 = useState(false);

  // ── Fetch danh sách bàn ──────────────────────────────────────────────────
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tableApi.getAll();
      setTables(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Không thể tải danh sách bàn. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  };

  // ── Chọn bàn — chỉ mở panel, KHÔNG đổi status
  const handleSelectTable = (table: RestaurantTable) => {
    if (table.status === 'MAINTENANCE') return;
    setSelectedTable(table);
    setPendingCart([]);
  };

  const handleClose = () => {
    setSelectedTable(null);
    setPendingCart([]);
  };

  // ── Pending cart 
  const addToPending = (dish: MenuDish) => {
    setPendingCart(prev => {
      const existing = prev.find(i => i.id === dish.id);
      if (existing) return prev.map(i => i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const removeFromPending = (id: number) => {
    setPendingCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0)
    );
  };

  // Order đã confirmed của bàn đang chọn
  const confirmedOrder = selectedTable ? (tableOrders[selectedTable.id] ?? []) : [];

  // Tổng tiền = confirmed + pending
  const allItems = [...confirmedOrder];
  for (const p of pendingCart) {
    const idx = allItems.findIndex(i => i.id === p.id);
    if (idx >= 0) allItems[idx] = { ...allItems[idx], quantity: allItems[idx].quantity + p.quantity };
    else allItems.push(p);
  }
  const totalPrice = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Xác nhận đặt món → gộp pending vào order của bàn ────────────────────
  const handleConfirm = async () => {
    if (pendingCart.length === 0 || !selectedTable) return;
    setConfirming(true);
    try {
      await new Promise(res => setTimeout(res, 800)); // giả lập orderApi

      // Đổi status → OCCUPIED khi xác nhận đặt món lần đầu
      if (selectedTable.status !== 'OCCUPIED') {
        const updatedTable = await tableApi.setStatus(selectedTable.id, 'OCCUPIED');
        setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
        setSelectedTable(updatedTable);
      }

      setTableOrders(prev => {
        const current = prev[selectedTable.id] ?? [];
        const updated = [...current];
        for (const p of pendingCart) {
          const idx = updated.findIndex(i => i.id === p.id);
          if (idx >= 0) updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + p.quantity };
          else updated.push(p);
        }
        return { ...prev, [selectedTable.id]: updated };
      });

      setPendingCart([]);
    } catch {
      alert('Lỗi khi đặt món, thử lại!');
    } finally {
      setConfirming(false);
    }
  };

  // ── Thanh toán → đổi bàn về AVAILABLE, xóa order ─────────────────────────
  const handlePayment = async () => {
    if (!selectedTable) return;
    setPaying(true);
    try {
      await new Promise(res => setTimeout(res, 800)); // giả lập paymentApi

      const updated = await tableApi.setStatus(selectedTable.id, 'AVAILABLE');
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));

      setTableOrders(prev => {
        const next = { ...prev };
        delete next[selectedTable.id];
        return next;
      });

      setSelectedTable(null);
      setPendingCart([]);
    } catch {
      alert('Lỗi thanh toán, thử lại!');
    } finally {
      setPaying(false);
    }
  };


  // ── Xoá bàn ──────────────────────────────────────────────────────────────
  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    setDeleting(true);
    try {
      await tableApi.delete(selectedTable.id);
      setTables(prev => prev.filter(t => t.id !== selectedTable.id));
      setTableOrders(prev => {
        const next = { ...prev };
        delete next[selectedTable.id];
        return next;
      });
      setSelectedTable(null);
      setPendingCart([]);
      setConfirmDelete(false);
    } catch {
      alert('Lỗi khi xoá bàn, thử lại!');
    } finally {
      setDeleting(false);
    }
  };

  // ── Thêm bàn mới ────────────────────────────────────────────────────────
  const handleAddTable = async () => {
    const tableNum = parseInt(addForm.tableNumber);
    const cap      = parseInt(addForm.capacity);
    if (!tableNum || tableNum <= 0) { setAddError('Số bàn không hợp lệ'); return; }
    if (!cap || cap <= 0)           { setAddError('Sức chứa không hợp lệ'); return; }
    if (tables.some(t => t.tableNumber === tableNum)) {
      setAddError(`Bàn số ${tableNum} đã tồn tại`); return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const newTable = await tableApi.create({
        tableNumber: tableNum,
        capacity: cap,
        location: addForm.location.trim() || undefined,
        status: 'AVAILABLE',
      });
      setTables(prev => [...prev, newTable].sort((a, b) => a.tableNumber - b.tableNumber));
      setShowAddModal(false);
      setAddForm({ tableNumber: '', capacity: '', location: '' });
    } catch {
      setAddError('Lỗi khi thêm bàn, thử lại!');
    } finally {
      setAdding(false);
    }
  };

  // ── Đặt trước → đổi status sang RESERVED ────────────────────────────────
  const handleReserve = async () => {
    if (!selectedTable) return;
    setReserving(true);
    try {
      const updated = await tableApi.setStatus(selectedTable.id, 'RESERVED');
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
      setSelectedTable(updated);
    } catch {
      alert('Lỗi khi đặt trước, thử lại!');
    } finally {
      setReserving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full relative font-[ui-sans-serif,system-ui,sans-serif]">
      <div className={`flex-1 p-4 transition-all duration-500 ${selectedTable ? 'pr-[400px]' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-semibold">Sơ đồ bàn</h2>
          <button
            onClick={() => { setShowAddModal(true); setAddError(null); setAddForm({ tableNumber: '', capacity: '', location: '' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#8C6F56] text-white rounded-xl text-sm font-medium hover:scale-[1.02] active:scale-95 transition-transform shadow-md shadow-[#8C6F56]/20"
          >
            <PlusCircle size={16} />
            Thêm bàn
          </button>
        </div>
        <p className="text-gray-400 mb-8">Sơ đồ bàn ăn của cửa hàng</p>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <Loader2 size={32} className="animate-spin mr-3" />
            <span>Đang tải danh sách bàn...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={fetchTables} className="text-sm font-medium underline">Thử lại</button>
          </div>
        )}

        {/* Grid bàn */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => {
              const style = STATUS_STYLE[table.status];
              const isSelected = selectedTable?.id === table.id;
              const orderCount = tableOrders[table.id]?.reduce((s, i) => s + i.quantity, 0) ?? 0;
              return (
                <div
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={`p-8 rounded-[2.5rem] border-2 transition-all hover:shadow-xl
                    ${table.status === 'MAINTENANCE' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                    ${isSelected ? 'border-[#8C6F56] bg-white' : style.card}
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-semibold text-gray-800">
                      {String(table.tableNumber).padStart(2, '0')}
                    </span>
                    <div className="bg-white/60 px-3 py-1 rounded-full flex items-center text-xs">
                      <Users size={12} className="mr-1" /> {table.capacity}
                    </div>
                  </div>
                  <p className="mt-2 font-medium text-gray-700">Bàn {String(table.tableNumber).padStart(2, '0')}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${style.badge}`}>
                      {style.label}
                    </span>
                    {orderCount > 0 && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                        {orderCount} món
                      </span>
                    )}
                  </div>
                  {table.location && (
                    <p className="mt-1 text-xs text-gray-400">{table.location}</p>
                  )}
                  {/* Nút xoá — hiện khi hover, chỉ cho bàn không có khách */}
                  {table.status !== 'OCCUPIED' && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedTable(table);
                        setConfirmDelete(true);
                      }}
                      className="mt-3 flex items-center gap-1.5 text-xs text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                      Xoá bàn
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Panel bên phải ── */}
      <div className={`fixed right-0 top-0 h-screen w-[380px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] transition-transform duration-500 z-50 flex flex-col
        ${selectedTable ? 'translate-x-0' : 'translate-x-full'}`}>

        {selectedTable && (
          <div className="flex flex-col h-full p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 uppercase">
                  Bàn {String(selectedTable.tableNumber).padStart(2, '0')}
                </h3>
                <p className="text-gray-400 text-sm">
                  Sức chứa: {selectedTable.capacity} người · {selectedTable.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition"
                  title="Xoá bàn"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={handleClose}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">

              {/* ── Đơn đã xác nhận ── */}
              {confirmedOrder.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 text-[#8C6F56] mb-3">
                    <ShoppingBag size={16} />
                    <span className="font-medium uppercase text-xs tracking-widest">Đã đặt</span>
                  </div>
                  <div className="space-y-2">
                    {confirmedOrder.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-[#FDF5E6] px-4 py-3 rounded-2xl border border-[#F3E8D6]"
                      >
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                          <p className="text-[#8C6F56] text-xs">{(item.price * item.quantity).toLocaleString()}đ</p>
                        </div>
                        <span className="text-sm text-gray-400">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Thêm món mới ── */}
              <div>
                <div className="flex items-center space-x-2 text-gray-400 mb-3">
                  <Plus size={16} />
                  <span className="font-medium uppercase text-xs tracking-widest">Thêm món</span>
                </div>

                {pendingCart.length === 0 ? (
                  <div className="text-center py-8 text-gray-300 border-2 border-dashed rounded-3xl text-sm">
                    Chọn món bên dưới để thêm vào đơn
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingCart.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100"
                      >
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                          <p className="text-gray-400 text-xs">{(item.price * item.quantity).toLocaleString()}đ</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                          <button onClick={() => removeFromPending(item.id)} className="p-1 hover:text-red-500">
                            <Minus size={14} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => addToPending(item)} className="p-1 hover:text-green-500">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Menu */}
                <div className="mt-4">
                  <p className="text-xs text-gray-300 uppercase mb-3 tracking-tighter">Thực đơn nhà hàng</p>
                  <div className="grid grid-cols-1 gap-2">
                    {MENU_DISHES.map(dish => (
                      <button
                        key={dish.id}
                        onClick={() => addToPending(dish)}
                        className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 hover:border-[#8C6F56] hover:bg-[#F3E8D6]/10 transition group text-left"
                      >
                        <div>
                          <span className="text-gray-700 text-sm">{dish.name}</span>
                          <span className="ml-3 text-xs text-gray-400">{dish.price.toLocaleString()}đ</span>
                        </div>
                        <Plus size={16} className="text-gray-300 group-hover:text-[#8C6F56]" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="pt-6 border-t border-gray-100 space-y-3 mt-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-gray-400 text-sm">Tổng cộng:</span>
                <span className="text-2xl font-semibold text-gray-800">{totalPrice.toLocaleString()}đ</span>
              </div>


              {/* Đặt trước — chỉ hiện khi bàn chưa có khách */}
              {selectedTable.status !== 'OCCUPIED' && confirmedOrder.length === 0 && (
                <button
                  onClick={handleReserve}
                  disabled={reserving || selectedTable.status === 'RESERVED'}
                  className="w-full border-2 border-purple-200 text-purple-600 py-3.5 rounded-2xl font-medium hover:bg-purple-50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {reserving ? <Loader2 size={16} className="animate-spin" /> : <BookMarked size={16} />}
                  {reserving ? 'Đang xử lý...' : selectedTable.status === 'RESERVED' ? 'Đã đặt trước' : 'Đặt trước'}
                </button>
              )}
              {/* Xác nhận đặt món — chỉ active khi có món mới chưa confirm */}
              <button
                onClick={handleConfirm}
                disabled={pendingCart.length === 0 || confirming}
                className="w-full bg-[#8C6F56] text-white py-3.5 rounded-2xl font-medium shadow-lg shadow-[#8C6F56]/20 hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {confirming && <Loader2 size={16} className="animate-spin" />}
                {confirming ? 'Đang xử lý...' : 'Xác nhận đặt món'}
              </button>

              {/* Thanh toán — chỉ hiện khi bàn đã có order đã confirm */}
              {confirmedOrder.length > 0 && (
                <button
                  onClick={handlePayment}
                  disabled={paying}
                  className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-medium hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  {paying ? 'Đang xử lý...' : 'Thanh toán'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modal xác nhận xoá bàn ── */}
      {confirmDelete && selectedTable && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs mx-4 p-8 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Xoá bàn {String(selectedTable.tableNumber).padStart(2, '0')}?</h3>
            <p className="text-gray-400 text-sm mb-6">
              {selectedTable.status === 'OCCUPIED'
                ? 'Bàn đang có khách, bạn chắc chắn muốn xoá?'
                : 'Hành động này không thể hoàn tác.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm hover:bg-gray-50 transition"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteTable}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={15} className="animate-spin" />}
                {deleting ? 'Đang xoá...' : 'Xoá bàn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal thêm bàn ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />

          {/* Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Thêm bàn mới</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Số bàn */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Số bàn</label>
                <input
                  type="number"
                  min={1}
                  placeholder="VD: 5"
                  value={addForm.tableNumber}
                  onChange={e => setAddForm(f => ({ ...f, tableNumber: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-[#8C6F56] transition"
                />
              </div>

              {/* Sức chứa */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Sức chứa (người)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="VD: 4"
                  value={addForm.capacity}
                  onChange={e => setAddForm(f => ({ ...f, capacity: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-[#8C6F56] transition"
                />
              </div>

              {/* Vị trí */}
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Vị trí <span className="normal-case text-gray-300">(tuỳ chọn)</span></label>
                <input
                  type="text"
                  placeholder="VD: Tầng 1, Ngoài trời..."
                  value={addForm.location}
                  onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-[#8C6F56] transition"
                />
              </div>

              {/* Error */}
              {addError && (
                <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{addError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm hover:bg-gray-50 transition"
              >
                Huỷ
              </button>
              <button
                onClick={handleAddTable}
                disabled={adding}
                className="flex-1 py-3 rounded-xl bg-[#8C6F56] text-white text-sm font-medium hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adding && <Loader2 size={15} className="animate-spin" />}
                {adding ? 'Đang thêm...' : 'Thêm bàn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;