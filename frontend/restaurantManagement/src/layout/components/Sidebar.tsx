import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Utensils, 
  Users, 
  LineChart, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState('tables');
  const [displayName, setDisplayName] = useState<string>('Admin');

  useEffect(() => {
    // Cập nhật lấy theo key fullName như Toản muốn
    const storedFullName = localStorage.getItem('userName'); 
    if (storedFullName) {
      setDisplayName(storedFullName);
    }
  }, []);

  const menuItems = [
    { id: 'tables', label: 'Sơ đồ bàn', icon: <LayoutDashboard size={22} strokeWidth={2} /> },
    { id: 'menu', label: 'Thực đơn', icon: <Utensils size={22} strokeWidth={2} /> },
    { id: 'staff', label: 'Nhân viên', icon: <Users size={22} strokeWidth={2} /> },
    { id: 'reports', label: 'Báo cáo', icon: <LineChart size={22} strokeWidth={2} /> },
  ];

  const handleNav = (id: string) => {
    setActive(id);
    navigate(`/${id}`);
  };

  const handleLogout = () => {
    localStorage.clear(); // Xóa sạch để bảo mật
    navigate('/login');
  };

  return (
    <aside className="sticky top-0 w-64 bg-[#F3E8D6] h-screen p-6 flex flex-col shadow-lg border-r border-gray-200/50">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-semibold text-[#333] tracking-tight">Restaurant</h1>
        <div className="flex items-center space-x-2 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          {/* Hiển thị Full Name của Toản tại đây */}
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            {displayName}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center space-x-4 w-full p-4 rounded-2xl transition-all duration-200 group ${
                isActive ? 'bg-[#8C6F56] text-white shadow-md' : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
              }`}
            >
              <div className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`}>
                {item.icon}
              </div>
              <span className="font-semibold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

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