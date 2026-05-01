import { Navigate, useLocation } from "react-router-dom";
import type { JSX } from "react/jsx-dev-runtime";

interface AuthGuardProps {
  children: JSX.Element;
  requiredRole?: string;
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const location = useLocation();
  
  // 1. Lấy token và thông tin user từ localStorage
  const token = localStorage.getItem("token");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  // 2. Nếu chưa đăng nhập -> Đá về trang /login
  // state={{ from: location }} giúp sau khi login xong có thể quay lại trang cũ
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Nếu có yêu cầu Role mà User không đủ quyền -> Hiện thông báo
  if (requiredRole && user?.role !== requiredRole) {
    console.warn(`Truy cập bị chặn: Yêu cầu ${requiredRole} nhưng bạn là ${user?.role}`);
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <h2 className="text-xl font-semibold text-red-500 mb-4">
          Nếu là quản lý thì hãy đăng nhập!
        </h2>
      </div>
    );
  }

  // 4. Mọi thứ ok? Cho đi tiếp vào trang con
  return children;
};

export default AuthGuard;