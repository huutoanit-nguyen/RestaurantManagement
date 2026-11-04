import test from 'node:test';
import assert from 'node:assert/strict';

// ── 1. VietQR Generation Logic ──
function buildVietQRUrl(bankId, accountNo, amount, description) {
  const encoded = encodeURIComponent(description);
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encoded}&accountName=ResMana`;
}

test('VietQR URL builder creates proper URL with bank, account, amount and description', () => {
  const url = buildVietQRUrl('MB', '0123456789', 240000, 'Table 03 - ResMana');
  assert.equal(url.startsWith('https://img.vietqr.io/image/MB-0123456789-compact2.png'), true);
  assert.equal(url.includes('amount=240000'), true);
  assert.equal(url.includes('addInfo=Table%2003%20-%20ResMana'), true);
  assert.equal(url.includes('accountName=ResMana'), true);
});

test('VietQR URL builder properly encodes special characters and accents', () => {
  const url = buildVietQRUrl('VCB', '987654321', 150000, 'Bàn 01: Cà phê & Nước ép');
  assert.equal(url.includes(' '), false, 'URL should not have raw spaces');
  assert.equal(url.includes('&'), true, 'Query params have ampersand delimiters');
  assert.equal(url.includes('addInfo=B%C3%A0n%2001%3A%20C%C3%A0%20ph%C3%AA%20%26%20N%C6%B0%E1%BB%9Bc%20%C3%A9p'), true);
});

// ── 2. Order Total Calculation Logic ──
function calculateTotal(confirmedItems, pendingCart) {
  const allItems = [...confirmedItems];
  for (const p of pendingCart) {
    const idx = allItems.findIndex(i => i.id === p.id);
    if (idx >= 0) allItems[idx] = { ...allItems[idx], quantity: allItems[idx].quantity + p.quantity };
    else allItems.push(p);
  }
  return allItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

test('calculateTotal correctly merges confirmed and pending items', () => {
  const confirmed = [
    { id: 1, name: 'Phở bò', price: 60000, quantity: 2 }, // 120,000
    { id: 2, name: 'Trà đá', price: 5000, quantity: 4 },  // 20,000
  ];
  const pending = [
    { id: 2, name: 'Trà đá', price: 5000, quantity: 2 },  // +10,000 (quantity becomes 6)
    { id: 3, name: 'Bánh flan', price: 20000, quantity: 1 } // +20,000
  ];

  const total = calculateTotal(confirmed, pending);
  // Expected: (60,000 * 2) + (5,000 * 6) + (20,000 * 1) = 120,000 + 30,000 + 20,000 = 170,000
  assert.equal(total, 170000);
});

test('calculateTotal with empty orders returns 0', () => {
  assert.equal(calculateTotal([], []), 0);
});

// ── 3. Table Status Style Definitions ──
const STATUS_STYLE = {
  AVAILABLE:   { card: 'bg-[#E9F5F8] border-[#D1E9F0]',    badge: 'bg-green-100 text-green-700',   label: 'Available'   },
  OCCUPIED:    { card: 'bg-amber-50/70 border-amber-200/60', badge: 'bg-red-100 text-red-700',       label: 'Occupied'    },
  RESERVED:    { card: 'bg-[#F0EBF8] border-[#DDD0EE]',    badge: 'bg-purple-100 text-purple-700', label: 'Reserved'    },
  MAINTENANCE: { card: 'bg-gray-100  border-gray-200',      badge: 'bg-gray-200 text-gray-500',     label: 'Maintenance' },
};

test('All TableStatus keys have valid card style, badge style, and English label', () => {
  const statuses = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'];
  for (const s of statuses) {
    const config = STATUS_STYLE[s];
    assert.ok(config, `Status ${s} must have styling configured`);
    assert.ok(config.card.length > 0);
    assert.ok(config.badge.length > 0);
    assert.ok(config.label.length > 0);
    assert.equal(typeof config.label, 'string');
  }
});

// ── 4. Session Storage Management Logic ──
class MockStorage {
  constructor() {
    this.store = {};
  }
  getItem(k) { return this.store[k] ?? null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}

const mockStorage = new MockStorage();

const sessionHelper = {
  save(data) {
    if (data.token) mockStorage.setItem('token', data.token);
    if (data.fullName !== undefined) mockStorage.setItem('fullName', data.fullName ?? '');
    if (data.restaurantId !== undefined) {
      if (data.restaurantId === null) mockStorage.removeItem('restaurantId');
      else mockStorage.setItem('restaurantId', String(data.restaurantId));
    }
    if (data.role !== undefined) mockStorage.setItem('role', data.role ?? '');
  },
  clear() {
    mockStorage.removeItem('token');
    mockStorage.removeItem('fullName');
    mockStorage.removeItem('restaurantId');
    mockStorage.removeItem('role');
  },
  get token() { return mockStorage.getItem('token'); },
  get restaurantId() {
    const v = mockStorage.getItem('restaurantId');
    return v ? Number(v) : null;
  },
  get role() { return mockStorage.getItem('role'); }
};

test('sessionHelper saves credentials and removes them on clear', () => {
  sessionHelper.save({
    token: 'jwt.sample.token',
    fullName: 'Manager User',
    restaurantId: 42,
    role: 'Quản lý'
  });

  assert.equal(sessionHelper.token, 'jwt.sample.token');
  assert.equal(sessionHelper.restaurantId, 42);
  assert.equal(sessionHelper.role, 'Quản lý');

  sessionHelper.clear();

  assert.equal(sessionHelper.token, null);
  assert.equal(sessionHelper.restaurantId, null);
  assert.equal(sessionHelper.role, null);
});

