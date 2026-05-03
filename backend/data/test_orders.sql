-- Xoá data cũ
DELETE FROM order_items;
DELETE FROM orders;

-- Dùng đúng tên cột restaurantTable_id
INSERT INTO orders (id, restaurantTable_id, status, totalPrice, created_at, paid_at) VALUES
(1, 1, 'PAID',    620000, NOW() - INTERVAL 3 HOUR, NOW() - INTERVAL 2 HOUR),
(2, 2, 'PAID',    440000, NOW() - INTERVAL 5 HOUR, NOW() - INTERVAL 4 HOUR),
(3, 3, 'PAID',    930000, NOW() - INTERVAL 6 HOUR, NOW() - INTERVAL 5 HOUR),
(4, 1, 'PENDING', 480000, NOW() - INTERVAL 1 HOUR, NULL),
(5, 4, 'PAID',    545000, NOW() - INTERVAL 2 HOUR, NOW() - INTERVAL 1 HOUR);

INSERT INTO order_items (id, order_id, menu_item_id, name, price, quantity) VALUES
(1,  1, 4,  'Bò Bít Tết (Wagyu)',            450000, 1),
(2,  1, 3,  'Khoai Tây Chiên Bơ Tỏi',        45000,  2),
(3,  1, 10, 'Cà Phê Muối',                    30000,  2),
(4,  2, 5,  'Cá Hồi Áp Chảo sốt Chanh Dây', 280000,  1),
(5,  2, 2,  'Salad Ức Gà',                    85000,  1),
(6,  2, 9,  'Trà Đào Cam Sả',                 35000,  2),
(7,  3, 4,  'Bò Bít Tết (Wagyu)',            450000,  1),
(8,  3, 5,  'Cá Hồi Áp Chảo sốt Chanh Dây', 280000,  1),
(9,  3, 1,  'Súp Bào Ngư',                   150000,  1),
(10, 3, 11, 'Nước Ép Cam Tươi',               40000,  1),
(11, 4, 4,  'Bò Bít Tết (Wagyu)',            450000,  1),
(12, 4, 9,  'Trà Đào Cam Sả',                 35000,  1),
(13, 5, 6,  'Mỳ Ý Hải Sản',                 120000,  2),
(14, 5, 7,  'Cơm Chiên Hải Sản Hoàng Kim',   95000,  1),
(15, 5, 8,  'Mỳ cay Hàn Quốc',               55000,  1),
(16, 5, 11, 'Nước Ép Cam Tươi',               40000,  1),
(17, 5, 9,  'Trà Đào Cam Sả',                 35000,  1);

UPDATE orders_SEQ      SET next_val = 6;
UPDATE order_items_SEQ SET next_val = 18;