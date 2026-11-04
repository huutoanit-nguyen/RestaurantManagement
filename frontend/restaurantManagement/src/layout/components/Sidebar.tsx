import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Users,
  LineChart,
  LogOut,
  KeyRound,
  UserCircle,
  Building2,
  RefreshCw,
  Info,
} from 'lucide-react';
import ProfileModal from '@/pages/ProfileModal';
import { session } from '@/api/auth';

// ─── Helpers Phân Quyền Vai Trò Chuẩn Mục 8 ──────────────────────────────────────
// | Mục menu | Chủ | Quản lý | Phục vụ | Thu ngân | Bếp |
// | Bàn      |  ✓  |    ✓    |    ✓    |    ✓     |     |
// | Order    |  ✓  |    ✓    |    ✓    |    ✓     |  ✓  |
// | Menu     |  ✓  |    ✓    |         |          |     |
// | Nhân viên|  ✓  |    ✓    |         |          |     |
// | Báo cáo  |  ✓  |    ✓    |         |          |     |
// | About    |  ✓  |    ✓    |    ✓    |    ✓     |  ✓  |

function checkRole(role: string | null) {
  const r = (role || '').trim().toLowerCase();
  const isOwner = r.includes('chủ') || r.includes('admin') || r.includes('owner');
  const isManager = r.includes('quản lý') || r.includes('manager') || isOwner;
  const isWaiter = r.includes('phục vụ') || r.includes('waiter') || isManager;
  const isCashier = r.includes('thu ngân') || r.includes('cashier') || isManager;
  const _isChef = r.includes('bếp') || r.includes('chef') || r.includes('cook');
  void _isChef; // declared for completeness but not used in current menu gating

  return {
    canViewTables: isOwner || isManager || isWaiter || isCashier, // Không có Bếp
    canViewMenuEdit: isOwner || isManager,
    canViewStaff: isOwner || isManager,
    canViewReports: isOwner || isManager,
    canViewAccounts: isOwner || isManager,
    canViewAbout: true, // Tất cả các vai trò
  };
}

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayName, setDisplayName] = useState<string>('Người dùng');
  const [userRole, setUserRole] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    const name = session.fullName;
    const role = session.role;
    const restName = session.restaurantName || 'ResMana';
    if (name) setDisplayName(name);
    if (role) setUserRole(role);
    if (restName) setRestaurantName(restName);
  }, []);

  const permissions = checkRole(userRole);

  const menuItems = [
    {
      id: 'tables',
      path: '/app/tables',
      label: 'Tables',
      icon: <LayoutDashboard size={20} strokeWidth={2.3} />,
      visible: permissions.canViewTables,
    },
    {
      id: 'menu',
      path: '/app/menu',
      label: 'Menu',
      icon: <Utensils size={20} strokeWidth={2.3} />,
      visible: permissions.canViewMenuEdit,
    },
    {
      id: 'staff',
      path: '/app/staff',
      label: 'Staff & Team',
      icon: <Users size={20} strokeWidth={2.3} />,
      visible: permissions.canViewStaff,
    },
    {
      id: 'reports',
      path: '/app/reports',
      label: 'Reports',
      icon: <LineChart size={20} strokeWidth={2.3} />,
      visible: permissions.canViewReports,
    },
    {
      id: 'accounts',
      path: '/app/accounts',
      label: 'Security',
      icon: <KeyRound size={20} strokeWidth={2.3} />,
      visible: permissions.canViewAccounts,
    },
    {
      id: 'about',
      path: '/app/about',
      label: 'About',
      icon: <Info size={20} strokeWidth={2.3} />,
      visible: permissions.canViewAbout,
    },
  ];

  const visibleItems = menuItems.filter((item) => item.visible);

  // Xác định active menu dựa theo pathname
  const currentPath = location.pathname;

  const handleNav = (path: string) => navigate(path);

  const handleSwitchRestaurant = () => {
    navigate('/choose-restaurant');
  };

  const handleLogout = () => {
    session.clear();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <aside className="sticky top-0 w-72 bg-[#F7F8F5] h-screen p-5 flex flex-col shadow-sm border-r border-[#202923]/10 select-none">
        {/* App Logo */}
        <div className="px-2 pt-1 pb-4 flex items-center justify-between">
          <img src="/logo-resmana.png" alt="ResMana" className="h-8 w-auto object-contain" />
        </div>

        {/* Brand & Restaurant Selector */}
        <div className="mb-6 pb-4 border-b border-[#202923]/10">
          <button
            onClick={() => setShowProfile(true)}
            className="px-2.5 py-2 text-left group w-full rounded-xl hover:bg-white/80 transition-colors focus:outline-none cursor-pointer"
            title="View profile details"
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-[#202923] text-[#C7F4A4] flex items-center justify-center font-bold text-base shadow flex-shrink-0">
                {restaurantName ? restaurantName.charAt(0).toUpperCase() : 'R'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-[#202923] truncate tracking-tight">
                  {restaurantName || 'ResMana Restaurant'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-[#52735B] rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-xs text-gray-600 font-medium truncate">
                    {displayName}
                  </span>
                </div>
              </div>
              <UserCircle size={20} className="text-gray-400 group-hover:text-[#52735B] transition flex-shrink-0" />
            </div>

            {userRole && (
              <div className="inline-flex mt-1.5 px-2.5 py-0.5 rounded-md bg-[#C7F4A4] text-[#202923] text-xs font-bold">
                {userRole}
              </div>
            )}
          </button>

          {/* Switch restaurant button */}
          <button
            onClick={handleSwitchRestaurant}
            className="mt-3.5 w-full px-3.5 py-2 rounded-xl border border-[#202923]/15 bg-white hover:bg-white/90 hover:border-[#52735B] text-sm font-bold text-[#202923] flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-sm"
          >
            <Building2 size={16} strokeWidth={2.3} className="text-[#52735B]" />
            <span>Switch Restaurant</span>
            <RefreshCw size={13} strokeWidth={2.3} className="opacity-70 ml-0.5 text-[#52735B]" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
          {visibleItems.map((item) => {
            const isActive =
              currentPath === item.path ||
              (item.id === 'tables' && (currentPath === '/app' || currentPath === '/app/tables'));

            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`flex items-center space-x-3.5 w-full py-3 px-4 rounded-xl transition-all duration-200 group text-left cursor-pointer font-bold ${
                  isActive
                    ? 'bg-[#202923] text-white shadow-md'
                    : 'text-[#202923]/80 hover:bg-white hover:text-[#202923]'
                }`}
              >
                <div
                  className={`transition-colors duration-200 flex-shrink-0 ${
                    isActive ? 'text-[#C7F4A4]' : 'text-gray-500 group-hover:text-[#202923]'
                  }`}
                >
                  {item.icon}
                </div>
                <span className="text-[15.5px] tracking-normal font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-[#202923]/10">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3.5 w-full py-3 px-4 rounded-xl text-[#202923]/80 hover:text-red-600 hover:bg-red-50/80 transition-all group cursor-pointer font-bold"
          >
            <LogOut size={20} strokeWidth={2.3} className="group-hover:translate-x-0.5 transition-transform text-gray-500 group-hover:text-red-600" />
            <span className="text-[15.5px] font-bold">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default Sidebar;
