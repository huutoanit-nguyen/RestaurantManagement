const BASE_URL = import.meta.env.VITE_API_URL;

// ─── Types ───────────────────────────────────────────────────────────────────
export type MenuCategory = 'Món chính' | 'Khai vị' | 'Đồ uống' | 'Tráng miệng';

export interface MenuItem {
  id: number;
  name: string;
  category: MenuCategory;
  price: number;
}

export interface CreateMenuItemRequest {
  name: string;
  category: MenuCategory;
  price: number;
}

export interface UpdateMenuItemRequest {
  name?: string;
  category?: MenuCategory;
  price?: number;
}

// ─── Helper ──────────────────────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const message = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(message || `HTTP ${res.status}`);
  }

  // 204 No Content (DELETE) — không parse body
  if (res.status === 204) return undefined as T;

  return res.json();
}

// ─── API ─────────────────────────────────────────────────────────────────────
export const menuApi = {
  /** GET /api/menu-items — lấy toàn bộ thực đơn */
  getAll(): Promise<MenuItem[]> {
    return request<MenuItem[]>('/api/menu-items');
  },

  /** GET /api/menu-items/{id} — lấy 1 món */
  getById(id: number): Promise<MenuItem> {
    return request<MenuItem>(`/api/menu-items/${id}`);
  },

  /** GET /api/menu-items?category={cat} — lọc theo danh mục */
  getByCategory(category: MenuCategory): Promise<MenuItem[]> {
    return request<MenuItem[]>(`/api/menu-items?category=${encodeURIComponent(category)}`);
  },

  /** POST /api/menu-items — thêm món mới */
  create(data: CreateMenuItemRequest): Promise<MenuItem> {
    return request<MenuItem>('/api/menu-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /** PUT /api/menu-items/{id} — cập nhật toàn bộ món */
  update(id: number, data: UpdateMenuItemRequest): Promise<MenuItem> {
    return request<MenuItem>(`/api/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** DELETE /api/menu-items/{id} — xoá món */
  delete(id: number): Promise<void> {
    return request<void>(`/api/menu-items/${id}`, { method: 'DELETE' });
  },
};