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
  name?: string;
}

export interface RestaurantDetail {
  id: number;
  name: string;
  ownerPhone?: string;
  createdAt?: string;
  staffCount?: number;
}

// Manages reading and writing the current user session to localStorage
export const session = {
  /** Persists auth response fields to localStorage */
  save(data: Partial<AuthResponse> & { token?: string }) {
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    if (data.fullName !== undefined) {
      localStorage.setItem('fullName', data.fullName ?? '');
      localStorage.setItem('userName', data.fullName ?? '');
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
      localStorage.setItem('userRole', data.role ?? '');
    }
    if (data.restaurants !== undefined) {
      localStorage.setItem('restaurants', JSON.stringify(data.restaurants ?? []));
    }
    if (data.name) {
      localStorage.setItem('restaurantName', data.name);
    }
  },

  /** Removes all session keys from localStorage (logout) */
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

// Generic API fetch helper — attaches Bearer token and handles 401 auto-logout
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
      message: err.message || 'Cannot connect to the server. Check your network or backend.',
    };
  }

  // Token expired or invalid — clear session and redirect to login
  if (res.status === 401 && session.token) {
    session.clear();
    window.location.href = '/login';
    throw { status: 401, message: 'Session expired. Please sign in again.' };
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    let msg = data?.message;
    if (!msg) {
      if (res.status === 401) msg = 'Invalid phone number or password';
      else if (res.status === 409) msg = 'Data already exists or conflicts';
      else if (res.status === 400) msg = 'Invalid request data';
      else msg = 'An error occurred. Please try again.';
    }
    throw { status: res.status, message: msg, data };
  }

  return data as T;
}

// Authentication API endpoints
export const authApi = {
  /** Registers a new account */
  register(payload: { phone: string; password: string; fullName: string }): Promise<AuthResponse> {
    return api<AuthResponse>('/api/auth/register', { method: 'POST', body: payload });
  },

  /** Authenticates an existing user */
  login(payload: { phone: string; password: string }): Promise<AuthResponse> {
    return api<AuthResponse>('/api/auth/login', { method: 'POST', body: payload });
  },

  /** Issues a scoped token for the chosen restaurant */
  selectRestaurant(restaurantId: number): Promise<AuthResponse> {
    return api<AuthResponse>('/api/auth/select-restaurant', { method: 'POST', body: { restaurantId } });
  },

  /** Creates a new restaurant workspace for the current user */
  createRestaurant(name: string): Promise<AuthResponse> {
    return api<AuthResponse>('/api/restaurants', { method: 'POST', body: { name } });
  },

  /** Returns detailed info for the currently selected restaurant */
  getRestaurantMe(): Promise<RestaurantDetail> {
    return api<RestaurantDetail>('/api/restaurants/me');
  },
};
