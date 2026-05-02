import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  Users,
  LineChart,
  LogOut,
  KeyRound,
} from 'lucide-react';

// ─── Helper ───────────────────────────────────────────────────────────────────
function isManager(): boolean {
  const role = localStorage.getItem('userRole') ?? '';
  return role.trim().toLowerCase() === 'quản lý' || role.trim() === 'Quản lý';
}

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation(); 
  const [displayName, setDisplayName] = useState<string>('Admin');
  const [userRole, setUserRole]       = useState<string>('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    if (name) setDisplayName(name);
    if (role) setUserRole(role);
  }, []);

  // ── Menu items ──────────────────────────────────────────────────────────────
  const menuItems = [
    { id: 'tables',  label: 'Sơ đồ bàn', icon: <LayoutDashboard size={22} strokeWidth={2} /> },
    { id: 'menu',    label: 'Thực đơn',   icon: <Utensils size={22} strokeWidth={2} /> },
    { id: 'staff',   label: 'Nhân viên',  icon: <Users size={22} strokeWidth={2} /> },
    { id: 'reports', label: 'Báo cáo',    icon: <LineChart size={22} strokeWidth={2} /> },
    // Chỉ quản lý mới thấy mục này — filter bên dưới
    {
      id: 'accounts',
      label: 'Tài khoản',
      icon: <KeyRound size={22} strokeWidth={2} />,
      managerOnly: true,
    },
  ];

  const visibleItems = menuItems.filter(item =>
    !item.managerOnly || isManager()
  );

  const active = location.pathname.replace('/', '') || 'tables';

  const handleNav = (id: string) => navigate(`/${id}`);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="sticky top-0 w-64 bg-[#F3E8D6] h-screen p-6 flex flex-col shadow-lg border-r border-gray-200/50">

      {/* Brand */}
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-semibold text-[#333] tracking-tight">Restaurant</h1>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {displayName}
          </p>
        </div>
        {/* Hiện role nhỏ bên dưới tên */}
        {userRole && (
          <p className="text-[10px] text-[#8C6F56] font-medium mt-0.5 px-0.5">{userRole}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        {visibleItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center space-x-4 w-full p-4 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#8C6F56] text-white shadow-md'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
              }`}
            >
              <div className={`transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'
              }`}>
                {item.icon}
              </div>
              <span className="font-semibold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pt-6 border-t border-gray-300/30">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all group"
        >
          <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;