import { Navigate, useLocation } from "react-router-dom";
import type { JSX } from "react/jsx-dev-runtime";
import { session } from "@/api/auth";

interface AuthGuardProps {
  children: JSX.Element;
  requiredRole?: string;
}

const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const location = useLocation();

  // 1. Lấy token từ session
  const token = session.token;
  const currentRole = session.role;

  // 2. Nếu chưa đăng nhập → Đá về trang /login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Nếu có yêu cầu Role mà User không đủ quyền → Hiện thông báo
  if (requiredRole && currentRole !== requiredRole) {
    console.warn(`Truy cập bị chặn: Yêu cầu ${requiredRole} nhưng bạn là ${currentRole}`);
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <h2 className="text-xl font-semibold text-red-500 mb-4">
          Bạn không có quyền truy cập tính năng này!
        </h2>
      </div>
    );
  }

  // 4. Mọi thứ ok → Cho đi tiếp
  return children;
};

export default AuthGuard;
