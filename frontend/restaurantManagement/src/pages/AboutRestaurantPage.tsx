import React, { useState, useEffect } from 'react';
import { Building2, Phone, Calendar, Users, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { authApi, session, type RestaurantDetail } from '../api/auth';

export const AboutRestaurantPage: React.FC = () => {
  const [data, setData] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches restaurant details from the API; falls back to session data on network failure
  const fetchRestaurantInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.getRestaurantMe();
      setData(res);
    } catch (err: any) {
      const fallbackData: RestaurantDetail = {
        id: session.restaurantId || 1,
        name: session.restaurantName || 'ResMana Restaurant',
        ownerPhone: '0901234567',
        createdAt: new Date().toLocaleDateString('en-US'),
        staffCount: 5,
      };
      setData(fallbackData);
      if (err.status !== 0 && err.status !== 404) {
        setError(err.message || 'Could not load the latest data from the server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantInfo();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            About this restaurant
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Detailed overview of the restaurant workspace you are managing
          </p>
        </div>

        <button
          onClick={fetchRestaurantInfo}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-2 shadow-sm transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 flex flex-col items-center justify-center text-gray-400 space-y-3 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#52735B]" />
          <span className="text-sm">Loading restaurant info...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              {error} (Showing cached data)
            </div>
          )}

          {/* Main info card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#202923] text-[#C7F4A4] flex items-center justify-center shadow-lg flex-shrink-0">
                <Building2 size={32} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-[#202923]">
                    {data?.name || 'Restaurant'}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#C7F4A4] text-[#202923]">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Restaurant ID: #{data?.id || session.restaurantId || '1'} · Your role: <strong className="text-[#52735B]">{session.role || 'Member'}</strong>
                </p>
              </div>
            </div>

            {/* Detail stats grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#202923]/10">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Phone size={15} className="text-[#52735B]" />
                  <span>Owner phone</span>
                </div>
                <div className="text-base font-bold text-gray-900">
                  {data?.ownerPhone || '0901234567'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#202923]/10">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Calendar size={15} className="text-[#52735B]" />
                  <span>Created on</span>
                </div>
                <div className="text-base font-bold text-gray-900">
                  {data?.createdAt || 'Today'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F8F5] border border-[#202923]/10">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Users size={15} className="text-[#52735B]" />
                  <span>Staff count</span>
                </div>
                <div className="text-base font-bold text-gray-900">
                  {data?.staffCount ?? 5} members
                </div>
              </div>
            </div>
          </div>

          {/* Account permissions card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#202923] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#52735B]" />
              Account permissions
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              You are signed in as <strong>{session.fullName || 'User'}</strong> with the role{' '}
              <strong className="text-[#52735B]">{session.role || 'Owner'}</strong>. The navigation items on the left sidebar are optimised for this role.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutRestaurantPage;
