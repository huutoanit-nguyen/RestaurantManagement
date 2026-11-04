import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Trash2, X, Loader2, Users, Edit2,
  UserCheck, UserX, Clock, ChevronDown,
} from 'lucide-react';
import { api, session } from '../api/auth';

// ─── Types ────────────────────────────────────────────────────────────────────
type Role = 'Quản lý' | 'Phục vụ' | 'Thu ngân' | 'Bếp';
type Shift = 'Ca sáng' | 'Ca chiều' | 'Ca tối';
type JoinStatus = 'PENDING' | 'ACTIVE' | 'REJECTED';

interface StaffView {
  membershipId: number;
  accountId: number;
  fullName: string;
  phone: string;
  role: Role;
  shift: Shift;
}

interface JoinRequest {
  id: number;
  accountId: number;
  fullName: string;
  phone: string;
  status: JoinStatus;
  requestedAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLES: Role[] = ['Quản lý', 'Phục vụ', 'Thu ngân', 'Bếp'];
const SHIFTS: Shift[] = ['Ca sáng', 'Ca chiều', 'Ca tối'];

const ROLE_BADGE: Record<string, string> = {
  'Quản lý': 'bg-amber-100 text-amber-700',
  'Phục vụ': 'bg-blue-100 text-blue-600',
  'Thu ngân': 'bg-green-100 text-green-700',
  'Bếp': 'bg-orange-100 text-orange-600',
  'Chủ cửa hàng': 'bg-rose-100 text-rose-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getMyRole(): string {
  return session.role ?? '';
}

function canManage(): boolean {
  const r = getMyRole().trim();
  return ['Chủ cửa hàng', 'Quản lý', 'CHU_CUA_HANG', 'QUAN_LY'].includes(r);
}

// Kiểm tra xem mình có thể gán role đó không
// Chủ: gán được tất cả. Quản lý: không gán được Quản lý.
function canAssignRole(targetRole: string): boolean {
  const myRole = getMyRole().trim();
  const isChu = myRole === 'Chủ cửa hàng' || myRole === 'CHU_CUA_HANG';
  if (isChu) return true;
  // Quản lý không gán Quản lý hoặc Chủ
  return !['Quản lý', 'QUAN_LY', 'Chủ cửa hàng', 'CHU_CUA_HANG'].includes(targetRole);
}

function assignableRoles(): Role[] {
  return ROLES.filter(r => canAssignRole(r));
}

// ─── Component ────────────────────────────────────────────────────────────────
const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<StaffView[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Edit modal
  const [editTarget, setEditTarget] = useState<StaffView | null>(null);
  const [editRole, setEditRole] = useState<Role>('Phục vụ');
  const [editShift, setEditShift] = useState<Shift>('Ca sáng');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<StaffView | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Join requests panel
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [jrLoading, setJrLoading] = useState(false);

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<JoinRequest | null>(null);
  const [approveRole, setApproveRole] = useState<Role>('Phục vụ');
  const [approveShift, setApproveShift] = useState<Shift>('Ca sáng');
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approveSaving, setApproveSaving] = useState(false);

  const isManager = canManage();

  // ── Load staff ──────────────────────────────────────────────────────────────
  const loadStaff = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await api<StaffView[]>('/api/staff');
      setStaff(data);
    } catch (e: any) {
      setFetchError(e.message ?? 'Không tải được danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load join requests ──────────────────────────────────────────────────────
  const loadJoinRequests = useCallback(async () => {
    if (!isManager) return;
    setJrLoading(true);
    try {
      const data = await api<JoinRequest[]>('/api/restaurants/me/join-requests');
      setJoinRequests(data.filter(r => r.status === 'PENDING'));
    } catch {

    } finally {
      setJrLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    loadStaff();
    loadJoinRequests();
  }, [loadStaff, loadJoinRequests]);

  // ── Edit (thay đổi role / shift) ────────────────────────────────────────────
  const openEdit = (s: StaffView) => {
    setEditTarget(s);
    setEditRole(s.role);
    setEditShift(s.shift);
    setEditError(null);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!editRole) { setEditError('Vui lòng chọn vai trò'); return; }
    if (!editShift) { setEditError('Vui lòng chọn ca làm việc'); return; }
    if (!canAssignRole(editRole)) {
      setEditError('Bạn không có quyền gán vai trò này');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await api(`/api/staff/${editTarget.membershipId}`, {
        method: 'PUT',
        body: { role: editRole, shift: editShift },
      });
      setStaff(prev =>
        prev.map(s =>
          s.membershipId === editTarget.membershipId
            ? { ...s, role: editRole, shift: editShift }
            : s
        )
      );
      setEditTarget(null);
    } catch (e: any) {
      setEditError(e.message ?? 'Cập nhật thất bại');
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/staff/${deleteTarget.membershipId}`, { method: 'DELETE' });
      setStaff(prev => prev.filter(s => s.membershipId !== deleteTarget.membershipId));
      setDeleteTarget(null);
    } catch (e: any) {
      // Hiện lỗi qua alert đơn giản
      alert(e.message ?? 'Xoá thất bại');
    } finally {
      setDeleting(false);
    }
  };

  // ── Approve join request ────────────────────────────────────────────────────
  const openApprove = (jr: JoinRequest) => {
    setApproveTarget(jr);
    setApproveRole('Phục vụ');
    setApproveShift('Ca sáng');
    setApproveError(null);
  };

  const handleApprove = async () => {
    if (!approveTarget) return;
    if (!approveRole) { setApproveError('Vui lòng chọn vai trò'); return; }
    if (!approveShift) { setApproveError('Vui lòng chọn ca'); return; }
    if (!canAssignRole(approveRole)) {
      setApproveError('Bạn không có quyền gán vai trò này');
      return;
    }
    setApproveSaving(true);
    setApproveError(null);
    try {
      await api(`/api/restaurants/me/join-requests/${approveTarget.id}/approve`, {
        method: 'PUT',
        body: { role: approveRole, shift: approveShift },
      });
      setJoinRequests(prev => prev.filter(r => r.id !== approveTarget.id));
      setApproveTarget(null);
      loadStaff(); // reload để thấy nhân viên mới
    } catch (e: any) {
      setApproveError(e.message ?? 'Duyệt thất bại');
    } finally {
      setApproveSaving(false);
    }
  };

  const handleReject = async (jr: JoinRequest) => {
    try {
      await api(`/api/restaurants/me/join-requests/${jr.id}/reject`, { method: 'PUT' });
      setJoinRequests(prev => prev.filter(r => r.id !== jr.id));
    } catch (e: any) {
      alert(e.message ?? 'Từ chối thất bại');
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = staff.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto bg-[#F7F8F5] p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={22} className="text-[#52735B]" />
            <div>
              <h1 className="text-xl font-bold text-[#202923]">Nhân viên</h1>
              <p className="text-xs text-gray-400">{staff.length} thành viên</p>
            </div>
          </div>
        </div>

        {/* ── Join requests (chỉ quản lý thấy) ── */}
        {isManager && (joinRequests.length > 0 || jrLoading) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <Clock size={14} />
              Yêu cầu tham gia ({joinRequests.length})
            </p>
            {jrLoading ? (
              <div className="flex justify-center py-2">
                <Loader2 size={18} className="animate-spin text-amber-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {joinRequests.map(jr => (
                  <div key={jr.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{jr.fullName}</p>
                      <p className="text-xs text-gray-400">{jr.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openApprove(jr)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#202923] text-[#C7F4A4] text-xs font-bold hover:bg-[#52735B] hover:text-white transition cursor-pointer"
                      >
                        <UserCheck size={13} /> Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(jr)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition cursor-pointer"
                      >
                        <UserX size={13} /> Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Search ── */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, SĐT hoặc vai trò..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#52735B] transition"
          />
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-[#52735B]" />
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{fetchError}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
            <Users size={36} className="opacity-30" />
            <p className="text-sm">{search ? 'Không tìm thấy nhân viên phù hợp' : 'Chưa có nhân viên nào'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filtered.map((s, idx) => (
              <div
                key={s.membershipId}
                className={`flex items-center justify-between px-5 py-4 ${idx < filtered.length - 1 ? 'border-b border-gray-50' : ''
                  }`}
              >
                {/* Avatar + info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#52735B]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#52735B] font-bold text-sm">
                      {s.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.fullName}</p>
                    <p className="text-xs text-gray-400">{s.phone} · {s.shift}</p>
                  </div>
                </div>

                {/* Badge + actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${ROLE_BADGE[s.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {s.role}
                  </span>
                  {isManager && (
                    <>
                      <button
                        onClick={() => openEdit(s)}
                        className="p-2 rounded-lg hover:bg-[#F7F8F5] text-gray-400 hover:text-[#52735B] transition cursor-pointer"
                        title="Sửa vai trò / ca"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition cursor-pointer"
                        title="Xoá khỏi nhà hàng"
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════ Modal sửa vai trò / ca ═══════════════════ */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-800">Cập nhật nhân viên</h3>
                <p className="text-xs text-gray-400 mt-0.5">{editTarget.fullName}</p>
              </div>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Vai trò</label>
                <div className="relative">
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as Role)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm bg-[#F7F8F5] focus:bg-white focus:ring-1 focus:ring-[#52735B] outline-none transition"
                  >
                    {assignableRoles().map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Ca làm việc</label>
                <div className="relative">
                  <select
                    value={editShift}
                    onChange={e => setEditShift(e.target.value as Shift)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm bg-[#F7F8F5] focus:bg-white focus:ring-1 focus:ring-[#52735B] outline-none transition"
                  >
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {editError && <p className="text-red-500 text-xs px-1">{editError}</p>}
            </div>

            <button
              onClick={handleEdit}
              disabled={editSaving}
              className="w-full mt-6 py-3 bg-[#202923] text-[#C7F4A4] rounded-xl font-bold text-sm hover:bg-[#52735B] hover:text-white transition flex justify-center items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {editSaving && <Loader2 size={15} className="animate-spin" />}
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════ Modal xác nhận xoá ═══════════════════ */}
      {deleteTarget && (
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
              Bạn có chắc muốn xoá{' '}
              <span className="font-semibold text-gray-700">{deleteTarget.fullName}</span>{' '}
              khỏi nhà hàng? Họ có thể xin vào lại nếu muốn.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Huỷ
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ Modal duyệt yêu cầu ═══════════════════ */}
      {approveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={() => setApproveTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-bold text-gray-800">Duyệt yêu cầu</h3>
                <p className="text-xs text-gray-400 mt-0.5">{approveTarget.fullName} — {approveTarget.phone}</p>
              </div>
              <button onClick={() => setApproveTarget(null)} className="text-gray-400 hover:text-gray-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Vai trò</label>
                <div className="relative">
                  <select
                    value={approveRole}
                    onChange={e => setApproveRole(e.target.value as Role)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm bg-[#F7F8F5] focus:bg-white focus:ring-1 focus:ring-[#52735B] outline-none transition"
                  >
                    {assignableRoles().map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Ca làm việc</label>
                <div className="relative">
                  <select
                    value={approveShift}
                    onChange={e => setApproveShift(e.target.value as Shift)}
                    className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 pr-9 text-sm bg-[#F7F8F5] focus:bg-white focus:ring-1 focus:ring-[#52735B] outline-none transition"
                  >
                    {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {approveError && <p className="text-red-500 text-xs px-1">{approveError}</p>}
            </div>

            <button
              onClick={handleApprove}
              disabled={approveSaving}
              className="w-full mt-6 py-3 bg-[#202923] text-[#C7F4A4] rounded-xl font-bold text-sm hover:bg-[#52735B] hover:text-white transition flex justify-center items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {approveSaving && <Loader2 size={15} className="animate-spin" />}
              Xác nhận duyệt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;
