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
    const restName = session.restaurantName || 'Galadan';
    if (name) setDisplayName(name);
    if (role) setUserRole(role);
    if (restName) setRestaurantName(restName);
  }, []);

  const permissions = checkRole(userRole);

  const menuItems = [
    {
      id: 'tables',
      path: '/app/tables',
      label: 'Sơ đồ bàn',
      icon: <LayoutDashboard size={20} strokeWidth={2.3} />,
      visible: permissions.canViewTables,
    },
    {
      id: 'menu',
      path: '/app/menu',
      label: 'Thực đơn',
      icon: <Utensils size={20} strokeWidth={2.3} />,
      visible: permissions.canViewMenuEdit,
    },
    {
      id: 'staff',
      path: '/app/staff',
      label: 'Nhân viên',
      icon: <Users size={20} strokeWidth={2.3} />,
      visible: permissions.canViewStaff,
    },
    {
      id: 'reports',
      path: '/app/reports',
      label: 'Báo cáo',
      icon: <LineChart size={20} strokeWidth={2.3} />,
      visible: permissions.canViewReports,
    },
    {
      id: 'accounts',
      path: '/app/accounts',
      label: 'Bảo mật',
      icon: <KeyRound size={20} strokeWidth={2.3} />,
      visible: permissions.canViewAccounts,
    },
    {
      id: 'about',
      path: '/app/about',
      label: 'Nhà hàng',
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
      <aside className="sticky top-0 w-72 bg-[#F3E8D6] h-screen p-5 flex flex-col shadow-lg border-r border-gray-200/50 select-none">
        {/* Brand & Restaurant Selector */}
        <div className="mb-6 pb-4 border-b border-gray-300/50">
          <button
            onClick={() => setShowProfile(true)}
            className="px-2 py-1 text-left group w-full rounded-xl hover:bg-white/40 transition-colors focus:outline-none cursor-pointer"
            title="Xem thông tin cá nhân"
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-[#8C6F56] text-white flex items-center justify-center font-bold text-base shadow flex-shrink-0">
                {restaurantName ? restaurantName.charAt(0).toUpperCase() : 'G'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-gray-900 truncate tracking-tight">
                  {restaurantName || 'Galadan Restaurant'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                  <span className="text-xs text-gray-600 font-medium truncate">
                    {displayName}
                  </span>
                </div>
              </div>
              <UserCircle size={20} className="text-gray-400 group-hover:text-[#8C6F56] transition flex-shrink-0" />
            </div>

            {userRole && (
              <div className="inline-flex mt-1.5 px-2.5 py-0.5 rounded-md bg-[#8C6F56]/15 text-[#8C6F56] text-xs font-semibold">
                {userRole}
              </div>
            )}
          </button>

          {/* Nút Đổi nhà hàng */}
          <button
            onClick={handleSwitchRestaurant}
            className="mt-3.5 w-full px-3.5 py-2 rounded-xl border border-[#8C6F56]/35 bg-white/75 hover:bg-white text-sm font-bold text-[#8C6F56] flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-sm"
          >
            <Building2 size={16} strokeWidth={2.3} />
            <span>Đổi nhà hàng</span>
            <RefreshCw size={13} strokeWidth={2.3} className="opacity-70 ml-0.5" />
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
                    ? 'bg-[#8C6F56] text-white shadow-md'
                    : 'text-gray-800 hover:bg-white/70 hover:text-gray-950'
                }`}
              >
                <div
                  className={`transition-colors duration-200 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-950'
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
        <div className="pt-4 border-t border-gray-300/50">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3.5 w-full py-3 px-4 rounded-xl text-gray-800 hover:text-red-600 hover:bg-red-50/80 transition-all group cursor-pointer font-bold"
          >
            <LogOut size={20} strokeWidth={2.3} className="group-hover:translate-x-0.5 transition-transform text-gray-600 group-hover:text-red-600" />
            <span className="text-[15.5px] font-bold">Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Profile Modal */}
      <ProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default Sidebar;
