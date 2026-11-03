import React, { useState, useEffect } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { session, api } from '../api/auth';

// ─── Auth ─────────────────────────────────────────────────────────────────────
function canViewReports(): boolean {
  const role = (session.role || localStorage.getItem('userRole') || '').trim().toLowerCase();
  return (
    role === 'chủ cửa hàng' ||
    role === 'chu_cua_hang' ||
    role === 'quản lý' ||
    role === 'quan_ly' ||
    role === 'admin'
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportSummary {
  revenueToday: number;
  totalOrders: number;
  totalDishes: number;   // thay "khách hàng" → "món đã bán"
  growthPercent: number;
}

interface DailyRevenue {
  day: string;
  revenue: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────
function fetchSummary(): Promise<ReportSummary> {
  return api<ReportSummary>('/api/reports/summary');
}

function fetchWeeklyRevenue(): Promise<DailyRevenue[]> {
  return api<DailyRevenue[]>('/api/reports/weekly');
}


// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, colorClass = 'text-gray-900' }) => (
  <div className="bg-[#FAF7F2] rounded-2xl border border-[#8C6F56]/15 p-5 flex flex-col justify-between">
    <p className="text-sm font-semibold text-gray-500 mb-2">{label}</p>
    <p className={`text-2xl font-bold tracking-tight ${colorClass}`}>{value}</p>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-[#8C6F56] font-bold">
        {payload[0].value.toLocaleString('vi-VN')}đ
      </p>
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const ReportsPage: React.FC = () => {
  const [summary, setSummary]   = useState<ReportSummary | null>(null);
  const [weekly, setWeekly]     = useState<DailyRevenue[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  // Chặn non-manager
  if (!canViewReports()) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white gap-4">
        <ShieldAlert size={40} className="text-gray-300" />
        <p className="text-gray-400 text-sm">Bạn không có quyền xem báo cáo</p>
      </div>
    );
  }

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, w] = await Promise.all([fetchSummary(), fetchWeeklyRevenue()]);
      setSummary(s);
      setWeekly(w);
    } catch {
      setError('Không tải được dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="flex-1 p-4 md:p-8 font-[ui-sans-serif,system-ui,sans-serif] h-full bg-white border-l border-gray-200 overflow-y-auto">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Báo cáo</h2>
        <p className="text-gray-400 text-sm mt-1">Thống kê và phân tích doanh thu</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-16 justify-center">
          <Loader2 size={18} className="animate-spin" /> Đang tải dữ liệu...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="text-xs underline ml-4">Thử lại</button>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* ── Stat cards (không có icon) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Doanh thu hôm nay"
              value={`${summary.revenueToday.toLocaleString('vi-VN')}đ`}
              colorClass="text-[#8C6F56]"
            />
            <StatCard
              label="Số đơn hàng"
              value={String(summary.totalOrders)}
            />
            <StatCard
              label="Món đã bán"
              value={String(summary.totalDishes)}
            />
            <StatCard
              label="Tăng trưởng"
              value={`${summary.growthPercent >= 0 ? '+' : ''}${summary.growthPercent}%`}
              colorClass={summary.growthPercent >= 0 ? 'text-emerald-600' : 'text-red-500'}
            />
          </div>

          {/* ── Bar chart — doanh thu tuần ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-6">Doanh thu tuần này</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weekly} barSize={48} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  tickFormatter={v => `${(v / 1000000).toFixed(1)}M`}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9F5F2' }} />
                <Bar dataKey="revenue" fill="#E8D5BE" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── Line chart — xu hướng ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold text-gray-800 mb-6">Xu hướng doanh thu</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weekly} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  tickFormatter={v => `${(v / 1000000).toFixed(1)}M`}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8C6F56"
                  strokeWidth={2.5}
                  dot={{ fill: '#8C6F56', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#8C6F56' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;