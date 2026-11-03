import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { session } from '@/api/auth';

interface Props {
  children: React.ReactNode;
  /** Yêu cầu phải đã chọn nhà hàng (chỉ cho vào /app khi restaurantId != null) */
  requireRestaurant?: boolean;
}

export const ProtectedRoute: React.FC<Props> = ({ children, requireRestaurant = true }) => {
  const location = useLocation();
  const token = session.token;
  const restaurantId = session.restaurantId;
  const restaurants = session.restaurants;

  // 1. Chưa đăng nhập -> Chuyển về /login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Nếu route yêu cầu đã chọn nhà hàng (/app/...) mà chưa có restaurantId
  if (requireRestaurant && (restaurantId === null || restaurantId === 0)) {
    if (restaurants.length >= 2) {
      return <Navigate to="/choose-restaurant" replace />;
    }
    if (restaurants.length === 1) {
      return <Navigate to="/choose-restaurant" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

/** Route chỉ dành cho khách chưa đăng nhập. Nếu đã có token thì đẩy vào app hoặc onboarding */
export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = session.token;
  const restaurantId = session.restaurantId;
  const restaurants = session.restaurants;

  if (token) {
    if (restaurantId != null && restaurantId !== 0) {
      return <Navigate to="/app" replace />;
    }
    if (restaurants.length >= 2) {
      return <Navigate to="/choose-restaurant" replace />;
    }
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
