import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './layout/components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import MainLayout from './layout/MainLayout';
import StaffPage from './pages/StaffPage';

export default function App() {
  return (
      <Routes>
  <Route path="/login" element={<LoginPage />} />

  {/* Nhóm tất cả các trang cần bảo vệ vào đây */}
  <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/tables" element={<Dashboard />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/staff" element={<StaffPage />} />
    <Route path="/reports" element={<h1>Coming Soon...</h1>} />
  </Route>
</Routes>
  );
}