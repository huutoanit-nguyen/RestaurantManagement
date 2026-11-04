-- Seed data cho dev / test

-- 1. Tài khoản chủ quán (Pass: Abcd1234)
INSERT INTO account (id, full_name, phone, password) VALUES 
(1, 'Nguyễn Hữu Toản', '0901234567', '$2a$12$eZBWeaMv/fgRhTt7XMnopOecxg3iAn/vInsjpyI77X.9n3EHsDSGe');

-- 2. Nhà hàng mẫu
INSERT INTO restaurant (id, name, owner_id, created_at) VALUES 
(1, 'Quán Ngon ResMana', 1, NOW());

-- 3. Membership Chủ cửa hàng
INSERT INTO membership (id, account_id, restaurant_id, role, shift, status) VALUES 
(1, 1, 1, 'Chủ cửa hàng', 'Tất cả', 'ACTIVE');

-- 4. Bàn ăn mẫu của Quán Ngon ResMana
INSERT INTO restaurant_table (restaurant_id, table_number, capacity, location, status) VALUES 
(1, 1, 4, 'Tầng 1', 'AVAILABLE'),
(1, 2, 4, 'Tầng 1', 'AVAILABLE'),
(1, 3, 6, 'Tầng 1', 'AVAILABLE'),
(1, 4, 8, 'Phòng VIP', 'AVAILABLE'),
(1, 5, 2, 'Sân vườn', 'AVAILABLE');

-- 5. Thực đơn mẫu của Quán Ngon ResMana
INSERT INTO menuitem (id, restaurant_id, category, name, price) VALUES 
(1, 1, 'Khai vị', 'Súp Bào Ngư', 150000),
(2, 1, 'Khai vị', 'Salad Ức Gà', 85000),
(3, 1, 'Khai vị', 'Khoai Tây Chiên Bơ Tỏi', 45000),
(4, 1, 'Món chính', 'Bò Bít Tết (Wagyu)', 450000),
(5, 1, 'Món chính', 'Cá Hồi Áp Chảo sốt Chanh Dây', 280000),
(6, 1, 'Món chính', 'Mỳ Ý Hải Sản', 120000),
(7, 1, 'Món chính', 'Cơm Chiên Hải Sản Hoàng Kim', 95000),
(8, 1, 'Món chính', 'Mỳ cay Hàn Quốc', 55000),
(9, 1, 'Đồ uống', 'Trà Đào Cam Sả', 35000),
(10, 1, 'Đồ uống', 'Cà Phê Muối', 30000),
(11, 1, 'Đồ uống', 'Nước Ép Cam Tươi', 40000);

-- 6. Cập nhật sequence tables để tránh xung đột Duplicate entry '1'
UPDATE account_SEQ SET next_val = 100;
UPDATE restaurant_SEQ SET next_val = 100;
UPDATE membership_SEQ SET next_val = 100;
UPDATE menuitem_SEQ SET next_val = 100;
UPDATE order_items_SEQ SET next_val = 100;
UPDATE orders_SEQ SET next_val = 100;
UPDATE password_change_log_SEQ SET next_val = 100;
