import { Routes, Route, Navigate } from 'react-router-dom';

// Pages – Auth Flow
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChooseRestaurantPage from './pages/ChooseRestaurantPage';
import OnboardingPage from './pages/OnboardingPage';

// Pages – App Shell
import MenuPage from './pages/MenuPage';
import Dashboard from './pages/Dashboard';
import MainLayout from './layout/MainLayout';
import StaffPage from './pages/StaffPage';
import AccountManagementPage from './pages/AccountManagementPage';
import ReportsPage from './pages/ReportsPage';
import AboutRestaurantPage from './pages/AboutRestaurantPage';

// Route Guards
import { ProtectedRoute, PublicOnlyRoute } from './layout/components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* ── Trang Landing (public, mọi người xem được) ── */}
      <Route path="/" element={<LandingPage />} />

      {/* ── Trang chỉ dành cho khách chưa đăng nhập ── */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      {/* ── Trang chỉ dành cho người đã đăng nhập (nhưng chưa chọn nhà hàng) ── */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute requireRestaurant={false}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/choose-restaurant"
        element={
          <ProtectedRoute requireRestaurant={false}>
            <ChooseRestaurantPage />
          </ProtectedRoute>
        }
      />

      {/* ── App – yêu cầu đã đăng nhập VÀ đã chọn nhà hàng ── */}
      <Route
        path="/app"
        element={
          <ProtectedRoute requireRestaurant={true}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* index: /app → /app/tables */}
        <Route index element={<Navigate to="/app/tables" replace />} />
        <Route path="tables" element={<Dashboard />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="accounts" element={<AccountManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="about" element={<AboutRestaurantPage />} />
      </Route>

      {/* ── Đường dẫn cũ tương thích ── */}
      <Route path="/tables" element={<Navigate to="/app/tables" replace />} />
      <Route path="/menu" element={<Navigate to="/app/menu" replace />} />
      <Route path="/staff" element={<Navigate to="/app/staff" replace />} />
      <Route path="/accounts" element={<Navigate to="/app/accounts" replace />} />
      <Route path="/reports" element={<Navigate to="/app/reports" replace />} />

      {/* ── 404 – Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
