import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Minus, X, ShoppingBag, Loader2, BookMarked, PlusCircle, Trash2, FileText, QrCode, CheckCircle2, CreditCard } from 'lucide-react';
import { tableApi } from '../api/tableApi';
import { menuApi } from '../api/menuApi';
import type { RestaurantTable, TableStatus } from '../types/table';
import type { MenuItem } from '../api/menuApi';
import { session } from '../api/auth';
import { useRestaurantSocket, type SocketMessage } from '../api/websocket';
import jsPDF from 'jspdf';

// ─── Types ───────────────────────────────────────────────────────────────────
interface CartItem extends MenuItem {
  quantity: number;
}

// Maps each table status to its card/badge display styles and English label
const STATUS_STYLE: Record<TableStatus, { card: string; badge: string; label: string }> = {
  AVAILABLE: { card: 'bg-[#E9F5F8] border-[#D1E9F0]', badge: 'bg-green-100 text-green-700', label: 'Available' },
  OCCUPIED: { card: 'bg-amber-50/70 border-amber-200/60', badge: 'bg-red-100 text-red-700', label: 'Occupied' },
  RESERVED: { card: 'bg-[#F0EBF8] border-[#DDD0EE]', badge: 'bg-purple-100 text-purple-700', label: 'Reserved' },
  MAINTENANCE: { card: 'bg-gray-100  border-gray-200', badge: 'bg-gray-200 text-gray-500', label: 'Maintenance' },
};

// Generic authenticated fetch helper — attaches Bearer token and throws on non-2xx
async function orderFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// Builds a VietQR image URL using the public VietQR API (no API key required)
function buildVietQRUrl(bankId: string, accountNo: string, amount: number, description: string): string {
  const encoded = encodeURIComponent(description);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encoded}&accountName=ResMana`;
}

// ────────────────────────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {

  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const [menuDishes, setMenuDishes] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuError, setMenuError] = useState<string | null>(null);

  const [tableOrders, setTableOrders] = useState<Record<number, CartItem[]>>({});
  const [pendingCart, setPendingCart] = useState<CartItem[]>([]);

  // Stores the real DB order ID per table, needed for pay/update endpoints
  const [tableOrderIds, setTableOrderIds] = useState<Record<number, number>>({});

  const [confirming, setConfirming] = useState(false);
  const [paying, setPaying] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ tableNumber: '', capacity: '', location: '' });
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [liveNotice, setLiveNotice] = useState<string | null>(null);

  // VietQR payment modal state
  const [showQR, setShowQR] = useState(false);
  const [qrConfirming, setQrConfirming] = useState(false);

  // Card (POS terminal) payment modal state
  const [showCard, setShowCard] = useState(false);
  const [cardConfirming, setCardConfirming] = useState(false);

  // Bank details — update these to match the restaurant's real account
  const BANK_ID = 'MB';
  const ACCOUNT_NO = '0000351212767';

  // Fetches all tables from the API and updates local state
  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tableApi.getAll();
      setTables(data);
    } catch {
      setError('Could not load tables. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Loads all PENDING orders to display item counts on each table card
  const loadActiveOrders = async () => {
    try {
      const orders = await orderFetch<any[]>('/api/orders?status=PENDING');
      const newTableOrders: Record<number, CartItem[]> = {};
      const newTableOrderIds: Record<number, number> = {};

      for (const ord of orders) {
        if (!ord.tableId) continue;
        newTableOrderIds[ord.tableId] = ord.id;
        newTableOrders[ord.tableId] = (ord.items || []).map((i: any) => ({
          id: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          category: '',
        }));
      }

      setTableOrders(newTableOrders);
      setTableOrderIds(newTableOrderIds);
    } catch {
      // silently ignore — table cards still render without order counts
    }
  };

  useEffect(() => {
    fetchTables();
    loadActiveOrders();
  }, []);

  // Handles incoming WebSocket events — refreshes data and shows a brief toast
  const handleSocketEvent = useCallback((msg: SocketMessage) => {
    fetchTables();
    loadActiveOrders();

    const notices: Partial<Record<SocketMessage['type'], string>> = {
      ORDER_CREATED: 'New order received!',
      ORDER_UPDATED: 'Order updated!',
      ORDER_PAID: 'Payment confirmed!',
      TABLE_CREATED: 'Table layout updated!',
      TABLE_UPDATED: 'Table layout updated!',
      TABLE_DELETED: 'Table layout updated!',
    };
    if (notices[msg.type]) setLiveNotice(notices[msg.type]!);
    setTimeout(() => setLiveNotice(null), 4500);
  }, []);

  const { isConnected } = useRestaurantSocket(session.restaurantId, handleSocketEvent);

  // Fetches menu items once when the side panel opens for the first time
  useEffect(() => {
    if (!selectedTable) return;
    if (menuDishes.length > 0) return;
    setMenuLoading(true);
    setMenuError(null);
    menuApi.getAll()
      .then(setMenuDishes)
      .catch(() => setMenuError('Could not load menu'))
      .finally(() => setMenuLoading(false));
  }, [selectedTable]);

  // Selects a table and opens the side panel (skips MAINTENANCE tables)
  const handleSelectTable = (table: RestaurantTable) => {
    if (table.status === 'MAINTENANCE') return;
    setSelectedTable(table);
    setPendingCart([]);
  };

  // Closes the side panel and resets the pending cart
  const handleClose = () => {
    setSelectedTable(null);
    setPendingCart([]);
  };

  // Adds a dish to the pending (not yet confirmed) cart
  const addToPending = (dish: MenuItem) => {
    setPendingCart(prev => {
      const existing = prev.find(i => i.id === dish.id);
      if (existing) return prev.map(i => i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  // Decrements a pending cart item; removes it when quantity reaches zero
  const removeFromPending = (id: number) => {
    setPendingCart(prev =>
      prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );
  };

  const confirmedOrder = selectedTable ? (tableOrders[selectedTable.id] ?? []) : [];

  // Merges confirmed order items with pending cart for the total price display
  const allItems = [...confirmedOrder];
  for (const p of pendingCart) {
    const idx = allItems.findIndex(i => i.id === p.id);
    if (idx >= 0) allItems[idx] = { ...allItems[idx], quantity: allItems[idx].quantity + p.quantity };
    else allItems.push(p);
  }
  const totalPrice = allItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Confirms the pending cart: marks table OCCUPIED and creates/updates the DB order
  const handleConfirm = async () => {
    if (pendingCart.length === 0 || !selectedTable) return;
    setConfirming(true);
    try {
      if (selectedTable.status !== 'OCCUPIED') {
        const updatedTable = await tableApi.setStatus(selectedTable.id, 'OCCUPIED');
        setTables(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
        setSelectedTable(updatedTable);
      }

      const existingOrderId = tableOrderIds[selectedTable.id];

      if (existingOrderId) {
        // Table already has an open order — append new items
        await orderFetch(`/api/orders/${existingOrderId}/items`, {
          method: 'POST',
          body: JSON.stringify({
            items: pendingCart.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
          }),
        });
      } else {
        // Create a brand-new order for this table
        const newOrder = await orderFetch<{ id: number }>('/api/orders', {
          method: 'POST',
          body: JSON.stringify({
            tableId: selectedTable.id,
            items: pendingCart.map(i => ({ menuItemId: i.id, quantity: i.quantity })),
          }),
        });
        setTableOrderIds(prev => ({ ...prev, [selectedTable.id]: newOrder.id }));
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
      alert('Failed to place order. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  // Calls the pay API, sets table back to AVAILABLE, and clears local order state
  const handlePayment = async () => {
    if (!selectedTable) return;
    setPaying(true);
    try {
      const orderId = tableOrderIds[selectedTable.id];
      if (orderId) {
        await orderFetch(`/api/orders/${orderId}/pay`, { method: 'PUT' });
      }
      const updated = await tableApi.setStatus(selectedTable.id, 'AVAILABLE');
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
      setTableOrders(prev => { const next = { ...prev }; delete next[selectedTable.id]; return next; });
      setTableOrderIds(prev => { const next = { ...prev }; delete next[selectedTable.id]; return next; });
      setSelectedTable(null);
      setPendingCart([]);
      setShowQR(false);
    } catch {
      alert('Payment failed. Please try again.');
    } finally {
      setPaying(false);
      setQrConfirming(false);
      setCardConfirming(false);
    }
  };

  // Opens the VietQR modal — the cashier shows the QR code for the customer to scan
  const handleOpenQR = () => {
    if (!selectedTable || confirmedOrder.length === 0) return;
    setShowQR(true);
  };

  // Called when the cashier taps "Confirm payment received" after the customer scans
  const handleQRConfirm = async () => {
    setQrConfirming(true);
    await handlePayment();
  };

  // Opens the card payment modal — cashier swipes card on POS, then confirms here
  const handleOpenCard = () => {
    if (!selectedTable || confirmedOrder.length === 0) return;
    setShowCard(true);
  };

  // Called after the physical POS terminal approves the card transaction
  const handleCardConfirm = async () => {
    setCardConfirming(true);
    await handlePayment();
    setShowCard(false);
  };

  // Deletes the selected table from the DB and removes it from local state
  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    setDeleting(true);
    try {
      await tableApi.delete(selectedTable.id);
      setTables(prev => prev.filter(t => t.id !== selectedTable.id));
      setTableOrders(prev => { const next = { ...prev }; delete next[selectedTable.id]; return next; });
      setTableOrderIds(prev => { const next = { ...prev }; delete next[selectedTable.id]; return next; });
      setSelectedTable(null);
      setPendingCart([]);
      setConfirmDelete(false);
    } catch {
      alert('Failed to delete table. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Validates inputs and creates a new table via the API
  const handleAddTable = async () => {
    const tableNum = parseInt(addForm.tableNumber);
    const cap = parseInt(addForm.capacity);
    if (!tableNum || tableNum <= 0) { setAddError('Invalid table number'); return; }
    if (!cap || cap <= 0) { setAddError('Invalid capacity'); return; }
    if (tables.some(t => t.tableNumber === tableNum)) {
      setAddError(`Table ${tableNum} already exists`); return;
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
      setAddError('Failed to add table. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  // Sets the selected table status to RESERVED
  const handleReserve = async () => {
    if (!selectedTable) return;
    setReserving(true);
    try {
      const updated = await tableApi.setStatus(selectedTable.id, 'RESERVED');
      setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
      setSelectedTable(updated);
    } catch {
      alert('Failed to reserve table. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  // Generates and downloads a PDF invoice for the current confirmed order (client-side, no API call)
  const handleExportInvoice = () => {
    if (!selectedTable || confirmedOrder.length === 0) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 12;
    let y = 14;

    doc.setFillColor(140, 111, 86);
    doc.rect(0, 0, pageW, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('PAYMENT RECEIPT', pageW / 2, y + 2, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('ResMana Restaurant Management', pageW / 2, y + 9, { align: 'center' });
    y = 34;

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(`TABLE ${String(selectedTable.tableNumber).padStart(2, '0')}`, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Capacity: ${selectedTable.capacity}`, pageW - margin, y, { align: 'right' });
    y += 5;
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    doc.text(`Date: ${new Date().toLocaleString('en-US')}`, margin, y);
    if (selectedTable.location) doc.text(`Location: ${selectedTable.location}`, pageW - margin, y, { align: 'right' });
    y += 7;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Item', margin, y);
    doc.text('Qty', pageW - 52, y, { align: 'right' });
    doc.text('Unit Price', pageW - 32, y, { align: 'right' });
    doc.text('Total', pageW - margin, y, { align: 'right' });
    y += 3;
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    confirmedOrder.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(250, 247, 242);
        doc.rect(margin - 1, y - 4, pageW - margin * 2 + 2, 7, 'F');
      }
      doc.setTextColor(50, 50, 50);
      const nameLines = doc.splitTextToSize(item.name, 55);
      doc.text(nameLines, margin, y);
      doc.text(String(item.quantity), pageW - 52, y, { align: 'right' });
      doc.text(item.price.toLocaleString('vi-VN'), pageW - 32, y, { align: 'right' });
      doc.text((item.price * item.quantity).toLocaleString('vi-VN'), pageW - margin, y, { align: 'right' });
      y += nameLines.length > 1 ? nameLines.length * 5 + 1 : 8;
    });

    y += 2;
    doc.setDrawColor(82, 115, 91);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 7;

    doc.setFillColor(199, 244, 164);
    doc.roundedRect(margin - 1, y - 5, pageW - margin * 2 + 2, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(32, 41, 35);
    doc.text('TOTAL:', margin + 2, y + 3);
    doc.text(`${totalPrice.toLocaleString('vi-VN')}d`, pageW - margin - 2, y + 3, { align: 'right' });
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(120, 120, 120);
    const totalQty = confirmedOrder.reduce((s, i) => s + i.quantity, 0);
    doc.text(`Total items: ${totalQty} | Types: ${confirmedOrder.length}`, margin, y);
    y += 10;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(82, 115, 91);
    doc.text('Thank you! See you again!', pageW / 2, y, { align: 'center' });
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('ResMana Restaurant Management', pageW / 2, y, { align: 'center' });

    const tableNum = String(selectedTable.tableNumber).padStart(2, '0');
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`invoice-table${tableNum}-${timestamp}.pdf`);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full relative">
      <div className={`flex-1 p-4 transition-all duration-500 ${selectedTable ? 'pr-[400px]' : ''}`}>

        {/* Realtime notification toast */}
        {liveNotice && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-[#202923] text-[#C7F4A4] text-sm font-bold flex items-center justify-between shadow-xl animate-in slide-in-from-top-2 border border-[#C7F4A4]/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C7F4A4] animate-ping" />
              <span>{liveNotice}</span>
            </div>
            <button onClick={() => setLiveNotice(null)} className="text-[#C7F4A4]/70 hover:text-[#C7F4A4] ml-2 p-1 cursor-pointer">
              <X size={15} />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-[#202923]">Table Map</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 bg-white shadow-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#52735B] animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-gray-700">{isConnected ? 'Realtime Live' : 'Connecting...'}</span>
            </div>
          </div>
          <button
            onClick={() => { setShowAddModal(true); setAddError(null); setAddForm({ tableNumber: '', capacity: '', location: '' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#202923] text-[#C7F4A4] rounded-xl text-sm font-bold hover:bg-[#52735B] hover:text-white hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-[#202923]/20 cursor-pointer"
          >
            <PlusCircle size={16} />
            Add table
          </button>
        </div>
        <p className="text-gray-400 mb-8">Restaurant floor plan</p>

        {loading && (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <Loader2 size={32} className="animate-spin mr-3 text-[#52735B]" />
            <span>Loading tables...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 mb-6 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={fetchTables} className="text-sm font-medium underline">Retry</button>
          </div>
        )}

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
                    ${isSelected ? 'border-[#52735B] ring-2 ring-[#52735B]/30 bg-white' : style.card}
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
                  <p className="mt-2 font-medium text-gray-700">Table {String(table.tableNumber).padStart(2, '0')}</p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${style.badge}`}>
                      {style.label}
                    </span>
                    {orderCount > 0 && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                        {orderCount} items
                      </span>
                    )}
                  </div>
                  {table.location && <p className="mt-1 text-xs text-gray-400">{table.location}</p>}
                  {table.status !== 'OCCUPIED' && (
                    <button
                      onClick={e => { e.stopPropagation(); setSelectedTable(table); setConfirmDelete(true); }}
                      className="mt-3 flex items-center gap-1.5 text-xs text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} /> Delete table
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right side panel — shows order details for the selected table */}
      <div className={`fixed right-0 top-0 h-screen w-[380px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.05)] transition-transform duration-500 z-50 flex flex-col
        ${selectedTable ? 'translate-x-0' : 'translate-x-full'}`}>

        {selectedTable && (
          <div className="flex flex-col h-full p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 uppercase">
                  Table {String(selectedTable.tableNumber).padStart(2, '0')}
                </h3>
                <p className="text-gray-400 text-sm">
                  Capacity: {selectedTable.capacity} · {selectedTable.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setConfirmDelete(true)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition">
                  <Trash2 size={18} />
                </button>
                <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">

              {/* Confirmed order items already sent to the kitchen */}
              {confirmedOrder.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 text-[#52735B] mb-3">
                    <ShoppingBag size={16} />
                    <span className="font-bold uppercase text-xs tracking-widest">Ordered</span>
                  </div>
                  <div className="space-y-2">
                    {confirmedOrder.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-[#F7F8F5] px-4 py-3 rounded-2xl border border-[#202923]/10">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                          <p className="text-[#52735B] text-xs font-medium">{(item.price * item.quantity).toLocaleString()}đ</p>
                        </div>
                        <span className="text-sm font-bold text-gray-500">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending cart — items staged but not yet confirmed to the kitchen */}
              <div>
                <div className="flex items-center space-x-2 text-gray-400 mb-3">
                  <Plus size={16} />
                  <span className="font-medium uppercase text-xs tracking-widest">Add items</span>
                </div>

                {pendingCart.length === 0 ? (
                  <div className="text-center py-8 text-gray-300 border-2 border-dashed rounded-3xl text-sm">
                    Select items below to add to the order
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingCart.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                          <p className="text-gray-400 text-xs">{(item.price * item.quantity).toLocaleString()}đ</p>
                        </div>
                        <div className="flex items-center space-x-3 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                          <button onClick={() => removeFromPending(item.id)} className="p-1 hover:text-red-500"><Minus size={14} /></button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => addToPending(item)} className="p-1 hover:text-green-500"><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Menu list fetched from the API */}
                <div className="mt-4">
                  <p className="text-xs text-gray-300 uppercase mb-3 tracking-tighter">Menu</p>

                  {menuLoading && (
                    <div className="flex items-center justify-center py-6 text-gray-300 gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-sm">Loading menu...</span>
                    </div>
                  )}

                  {menuError && (
                    <div className="text-red-400 text-xs text-center py-4 bg-red-50 rounded-2xl">
                      {menuError}
                      <button
                        onClick={() => {
                          setMenuError(null);
                          setMenuLoading(true);
                          menuApi.getAll()
                            .then(setMenuDishes)
                            .catch(() => setMenuError('Could not load menu'))
                            .finally(() => setMenuLoading(false));
                        }}
                        className="block mx-auto mt-1 underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!menuLoading && !menuError && (
                    <div className="grid grid-cols-1 gap-2">
                      {menuDishes.map(dish => (
                        <button
                          key={dish.id}
                          onClick={() => addToPending(dish)}
                          className="flex justify-between items-center p-4 rounded-2xl border border-gray-100 hover:border-[#52735B] hover:bg-[#F7F8F5] transition group text-left cursor-pointer"
                        >
                          <div>
                            <span className="text-gray-700 text-sm">{dish.name}</span>
                            <span className="ml-3 text-xs text-gray-400">{dish.price.toLocaleString()}đ</span>
                          </div>
                          <Plus size={16} className="text-gray-300 group-hover:text-[#52735B]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer — total price and action buttons */}
            <div className="pt-6 border-t border-gray-100 space-y-3 mt-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-gray-400 text-sm">Total:</span>
                <span className="text-2xl font-semibold text-gray-800">{totalPrice.toLocaleString()}đ</span>
              </div>

              {selectedTable.status !== 'OCCUPIED' && confirmedOrder.length === 0 && (
                <button
                  onClick={handleReserve}
                  disabled={reserving || selectedTable.status === 'RESERVED'}
                  className="w-full border-2 border-purple-200 text-purple-600 py-3.5 rounded-2xl font-medium hover:bg-purple-50 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {reserving ? <Loader2 size={16} className="animate-spin" /> : <BookMarked size={16} />}
                  {reserving ? 'Processing...' : selectedTable.status === 'RESERVED' ? 'Already reserved' : 'Reserve'}
                </button>
              )}

              <button
                onClick={handleConfirm}
                disabled={pendingCart.length === 0 || confirming}
                className="w-full bg-[#202923] text-[#C7F4A4] py-3.5 rounded-2xl font-bold shadow-lg shadow-[#202923]/20 hover:bg-[#52735B] hover:text-white hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
              >
                {confirming && <Loader2 size={16} className="animate-spin" />}
                {confirming ? 'Processing...' : 'Confirm order'}
              </button>

              {confirmedOrder.length > 0 && (
                <div className="space-y-2">
                  <button
                    onClick={handleExportInvoice}
                    className="w-full border-2 border-[#52735B] text-[#52735B] py-3 rounded-2xl font-bold hover:bg-[#F7F8F5] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText size={16} />
                    Print Invoice
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleOpenQR}
                      disabled={paying}
                      className="flex-1 bg-green-600 text-white py-3.5 rounded-2xl font-medium hover:bg-green-700 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {paying && qrConfirming ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                      Pay via QR
                    </button>
                    <button
                      onClick={handleOpenCard}
                      disabled={paying}
                      className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-medium hover:bg-blue-700 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {paying && cardConfirming ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                      Pay by Card
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* VietQR payment modal — displays QR code for the customer to scan */}
      {showQR && selectedTable && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!qrConfirming) setShowQR(false); }} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center">
            <button
              onClick={() => setShowQR(false)}
              disabled={qrConfirming}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition text-gray-400 disabled:opacity-30"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <QrCode size={26} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Scan to Pay</h3>
            <p className="text-sm text-gray-400 mb-1">Table {String(selectedTable.tableNumber).padStart(2, '0')}</p>
            <p className="text-2xl font-bold text-[#202923] mb-5">{totalPrice.toLocaleString()}đ</p>

            {/* VietQR image — generated client-side via public API, no backend required */}
            <div className="w-56 h-56 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm mb-4 bg-gray-50 flex items-center justify-center">
              <img
                src={buildVietQRUrl(
                  BANK_ID,
                  ACCOUNT_NO,
                  totalPrice,
                  `Table ${String(selectedTable.tableNumber).padStart(2, '0')} - ResMana`
                )}
                alt="VietQR payment code"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>

            <p className="text-xs text-gray-400 text-center mb-1">
              Bank: <strong className="text-gray-700">{BANK_ID}</strong> · Account: <strong className="text-gray-700">{ACCOUNT_NO}</strong>
            </p>
            <p className="text-xs text-gray-300 text-center mb-6">
              The QR includes the transfer amount and table reference automatically.
            </p>

            <button
              onClick={handleQRConfirm}
              disabled={qrConfirming}
              className="w-full bg-green-600 text-white py-3.5 rounded-2xl font-bold hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {qrConfirming
                ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                : <><CheckCircle2 size={16} /> Confirm payment received</>
              }
            </button>
            <p className="text-xs text-gray-300 mt-3 text-center">
              Tap the button above after the customer's transfer has cleared.
            </p>
          </div>
        </div>
      )}

      {/* Card (POS terminal) payment modal */}
      {showCard && selectedTable && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (!cardConfirming) setShowCard(false); }} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center">
            <button
              onClick={() => setShowCard(false)}
              disabled={cardConfirming}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition text-gray-400 disabled:opacity-30"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <CreditCard size={26} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Pay by Card</h3>
            <p className="text-sm text-gray-400 mb-1">Table {String(selectedTable.tableNumber).padStart(2, '0')}</p>
            <p className="text-3xl font-bold text-[#202923] mb-6">{totalPrice.toLocaleString()}đ</p>

            {/* Step-by-step guide for the cashier */}
            <div className="w-full space-y-3 mb-6">
              {[
                { step: '1', text: 'Hand the POS terminal to the customer' },
                { step: '2', text: 'Customer inserts, taps, or swipes their card' },
                { step: '3', text: 'Wait for the terminal to print an approval slip' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step}
                  </span>
                  <span className="text-sm text-gray-600">{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleCardConfirm}
              disabled={cardConfirming}
              className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {cardConfirming
                ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                : <><CheckCircle2 size={16} /> Card approved — confirm payment</>
              }
            </button>
            <p className="text-xs text-gray-300 mt-3 text-center">
              Only tap after the terminal shows an approved transaction.
            </p>
          </div>
        </div>
      )}

      {/* Delete table confirmation modal */}
      {confirmDelete && selectedTable && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-xs mx-4 p-8 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              Delete Table {String(selectedTable.tableNumber).padStart(2, '0')}?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {selectedTable.status === 'OCCUPIED'
                ? 'This table has active guests. Are you sure?'
                : 'This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleDeleteTable} disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting && <Loader2 size={15} className="animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add new table modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add new table</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Table number</label>
                <input type="number" min={1} placeholder="e.g. 5" value={addForm.tableNumber}
                  onChange={e => setAddForm(f => ({ ...f, tableNumber: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-[#52735B] transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Capacity</label>
                <input type="number" min={1} placeholder="e.g. 4" value={addForm.capacity}
                  onChange={e => setAddForm(f => ({ ...f, capacity: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-[#52735B] transition" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Location <span className="normal-case text-gray-300">(optional)</span></label>
                <input type="text" placeholder="e.g. Floor 1, Outdoor..." value={addForm.location}
                  onChange={e => setAddForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:border-[#52735B] transition" />
              </div>
              {addError && <p className="text-red-500 text-sm bg-red-50 px-4 py-2 rounded-xl">{addError}</p>}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm hover:bg-gray-50 transition cursor-pointer">Cancel</button>
              <button onClick={handleAddTable} disabled={adding}
                className="flex-1 py-3 rounded-xl bg-[#202923] text-[#C7F4A4] text-sm font-bold hover:bg-[#52735B] hover:text-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
                {adding && <Loader2 size={15} className="animate-spin" />}
                {adding ? 'Adding...' : 'Add table'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
