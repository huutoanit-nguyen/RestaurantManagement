
INSERT INTO staff (id, fullName, role, shift, username, password) 
VALUES (2, 'Nguyễn Hữu Toản', 'Quản lý', 'Ca sáng', 'admin', '$2a$12$LfaYDJ5iKujXYCazU6EoJO84TLJlnOTNpwngFi9QpI7AzbN6U7otS');

UPDATE staff_SEQ SET next_val = 2;


INSERT INTO MenuItem (category, name, price) VALUES ('Khai vị', 'Súp Bào Ngư', 150000);
INSERT INTO MenuItem (category, name, price) VALUES ('Khai vị', 'Salad Ức Gà', 85000);
INSERT INTO MenuItem (category, name, price) VALUES ('Khai vị', 'Khoai Tây Chiên Bơ Tỏi', 45000);

INSERT INTO MenuItem (category, name, price) VALUES ('Món chính', 'Bò Bít Tết (Wagyu)', 450000);
INSERT INTO MenuItem (category, name, price) VALUES ('Món chính', 'Cá Hồi Áp Chảo sốt Chanh Dây', 280000);
INSERT INTO MenuItem (category, name, price) VALUES ('Món chính', 'Mỳ Ý Hải Sản', 120000);
INSERT INTO MenuItem (category, name, price) VALUES ('Món chính', 'Cơm Chiên Hải Sản Hoàng Kim', 95000);
INSERT INTO MenuItem (category, name, price) VALUES ('Món chính', 'Mỳ cay Hàn Quốc', 55000);

INSERT INTO MenuItem (category, name, price) VALUES ('Đồ uống', 'Trà Đào Cam Sả', 35000);
INSERT INTO MenuItem (category, name, price) VALUES ('Đồ uống', 'Cà Phê Muối', 30000);
INSERT INTO MenuItem (category, name, price) VALUES ('Đồ uống', 'Nước Ép Cam Tươi', 40000);

UPDATE MenuItem_SEQ SET next_val = 11;

CREATE TABLE password_change_log_SEQ (next_val BIGINT NOT NULL);
INSERT INTO password_change_log_SEQ VALUES (1);

CREATE TABLE password_change_log (
    id         BIGINT       NOT NULL,
    staff_id   BIGINT       NOT NULL,
    staff_name VARCHAR(255) NOT NULL,
    changed_at DATETIME     NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
