import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, ArrowRight, Loader2, Plus, LogOut, AlertCircle } from 'lucide-react';
import { authApi, session, type RestaurantItem } from '../api/auth';

export const ChooseRestaurantPage: React.FC = () => {
  const navigate = useNavigate();
  const [restaurants] = useState<RestaurantItem[]>(() => session.restaurants);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (restaurantId: number) => {
    setLoadingId(restaurantId);
    setError(null);

    try {
      const res = await authApi.selectRestaurant(restaurantId);
      // Replace token, save active restaurantId and role
      session.save({
        ...res,
        restaurantId: res.restaurantId || restaurantId,
      });

      // Navigate to /app
      navigate('/app', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Unable to select this restaurant. Please try again.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleLogout = () => {
    session.clear();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <Link to="/" className="inline-flex items-center justify-center group mb-4">
          <img src="/logo-resmana.png" alt="ResMana" className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
        </Link>
        <h2 className="text-2xl font-extrabold text-[#202923] tracking-tight">
          Choose your workspace
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Welcome <strong className="text-gray-800">{session.fullName || 'there'}</strong>, select a restaurant to manage today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl sm:rounded-2xl border border-gray-100">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <AlertCircle size={18} className="flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {restaurants.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#52735B]/10 text-[#52735B] mx-auto flex items-center justify-center">
                <Building2 size={32} />
              </div>
              <p className="text-gray-600 text-sm">
                You don't belong to any restaurant yet or your list is empty.
              </p>
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#202923] text-[#C7F4A4] text-sm font-bold hover:bg-[#52735B] hover:text-white transition cursor-pointer"
              >
                <Plus size={16} /> Create or join a restaurant
              </Link>
            </div>
          ) : (
            <div className="space-y-3.5">
              {restaurants.map((rest) => {
                const isLoading = loadingId === rest.id;
                return (
                  <button
                    key={rest.id}
                    onClick={() => handleSelect(rest.id)}
                    disabled={loadingId !== null}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 bg-[#F7F8F5]/60 hover:bg-[#52735B]/5 hover:border-[#52735B]/40 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#52735B] shadow-sm group-hover:scale-105 group-hover:bg-[#202923] group-hover:text-[#C7F4A4] transition-all">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-[#52735B] transition-colors">
                          {rest.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Shield size={12} className="text-[#52735B]" />
                          <span className="text-xs font-medium text-gray-500">
                            {rest.role || 'Member'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin text-[#52735B]" />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#52735B] group-hover:border-[#52735B] transition-all">
                          <ArrowRight size={16} />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Secondary Actions */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs">
            <Link
              to="/onboarding"
              className="text-[#52735B] font-bold hover:underline flex items-center gap-1"
            >
              <Plus size={14} /> Add another restaurant
            </Link>

            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseRestaurantPage;

