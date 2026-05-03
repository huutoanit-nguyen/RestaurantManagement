import { Routes, Route } from 'react-router-dom';
import MenuPage from './pages/MenuPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './layout/components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import MainLayout from './layout/MainLayout';
import StaffPage from './pages/StaffPage';
import AccountManagementPage from './pages/AccountManagementPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
      <Routes>
  <Route path="/login" element={<LoginPage />} />

  <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
    <Route path="/" element={<Dashboard />} />
    <Route path="/tables" element={<Dashboard />} />
    <Route path="/menu" element={<MenuPage />} />
    <Route path="/staff" element={<StaffPage />} />
    <Route path="/accounts" element={<AccountManagementPage/>}/>
    <Route path="/reports" element={<ReportsPage/>} />
  </Route>
</Routes>
  );
}