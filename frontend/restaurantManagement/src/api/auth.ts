// src/api/auth.ts

export interface RestaurantItem {
  id: number;
  name: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  fullName?: string;
  restaurantId?: number | null;
  role?: string | null;
  restaurants?: RestaurantItem[];
  name?: string; // khi tạo nhà hàng
}

export interface RestaurantDetail {
  id: number;
  name: string;
  ownerPhone?: string;
  createdAt?: string;
  staffCount?: number;
}

// Quản lý lưu trữ phiên người dùng
export const session = {
  save(data: Partial<AuthResponse> & { token?: string }) {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.fullName !== undefined) {
      localStorage.setItem('fullName', data.fullName ?? '');
      localStorage.setItem('userName', data.fullName ?? ''); // tương thích UI cũ
    }
    if (data.restaurantId !== undefined) {
      if (data.restaurantId === null) {
        localStorage.removeItem('restaurantId');
      } else {
        localStorage.setItem('restaurantId', String(data.restaurantId));
      }
    }
    if (data.role !== undefined) {
      localStorage.setItem('role', data.role ?? '');
      localStorage.setItem('userRole', data.role ?? ''); // tương thích UI cũ
    }
    if (data.restaurants !== undefined) {
      localStorage.setItem('restaurants', JSON.stringify(data.restaurants ?? []));
    }
    if (data.name) {
      localStorage.setItem('restaurantName', data.name);
    }
  },

  clear() {
    localStorage.removeItem('token');
    localStorage.removeItem('fullName');
    localStorage.removeItem('userName');
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('role');
    localStorage.removeItem('userRole');
    localStorage.removeItem('restaurants');
    localStorage.removeItem('restaurantName');
  },

  get token(): string | null {
    return localStorage.getItem('token');
  },

  get role(): string | null {
    return localStorage.getItem('role') || localStorage.getItem('userRole');
  },

  get restaurantId(): number | null {
    const val = localStorage.getItem('restaurantId');
    return val ? Number(val) : null;
  },

  get fullName(): string {
    return localStorage.getItem('fullName') || localStorage.getItem('userName') || '';
  },

  get restaurantName(): string {
    return localStorage.getItem('restaurantName') || '';
  },

  get restaurants(): RestaurantItem[] {
    try {
      const raw = localStorage.getItem('restaurants');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
};

const API_BASE = import.meta.env.VITE_API_URL || '';

// Hàm gọi API dùng chung tự gắn token và xử lý 401
export async function api<T = any>(
  path: string,
  { method = 'GET', body }: { method?: string; body?: any } = {}
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (session.token) {
    headers['Authorization'] = 'Bearer ' + session.token;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err: any) {
    throw {
      status: 0,
      message: err.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc backend.',
    };
  }

  // Token hết hạn (24h) hoặc không hợp lệ -> đăng nhập lại
  if (res.status === 401 && session.token) {
    session.clear();
    window.location.href = '/login';
    throw { status: 401, message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' };
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    let msg = data?.message;
    if (!msg) {
      if (res.status === 401) msg = 'Sai số điện thoại hoặc mật khẩu';
      else if (res.status === 409) msg = 'Dữ liệu đã tồn tại hoặc bị trùng lặp';
      else if (res.status === 400) msg = 'Dữ liệu không hợp lệ';
      else msg = 'Có lỗi xảy ra, vui lòng thử lại';
    }
    throw { status: res.status, message: msg, data };
  }

  return data as T;
}

// API Authentication
export const authApi = {
  register(payload: { phone: string; password: string; fullName: string }): Promise<AuthResponse> {
    return api<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  login(payload: { phone: string; password: string }): Promise<AuthResponse> {
    return api<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  selectRestaurant(restaurantId: number): Promise<AuthResponse> {
    return api<AuthResponse>('/api/auth/select-restaurant', {
      method: 'POST',
      body: { restaurantId },
    });
  },

  createRestaurant(name: string): Promise<AuthResponse> {
    return api<AuthResponse>('/api/restaurants', {
      method: 'POST',
      body: { name },
    });
  },

  getRestaurantMe(): Promise<RestaurantDetail> {
    return api<RestaurantDetail>('/api/restaurants/me');
  },
};

