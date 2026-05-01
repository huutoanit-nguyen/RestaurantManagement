DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS staff_SEQ;

CREATE TABLE staff_SEQ (
    next_val BIGINT NOT NULL
);

INSERT INTO staff_SEQ VALUES (1);

CREATE TABLE staff (
    id       BIGINT       NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    role     VARCHAR(100) NOT NULL,
    shift    VARCHAR(50)  NOT NULL,
    username VARCHAR(50)  NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO staff (id, fullName, role, shift, username, password) 
VALUES (1, 'Nguyễn Văn A', 'Quản lý', 'Ca sáng', 'admin', '$2a$10$eokvvzdOnL.V6Y.6L3K2ueH/N8k.SndS7q.B1o4.q8S.SndS7q.B1');

INSERT INTO staff (id, fullName, role, shift, username, password) 
VALUES (2, 'Trần Thị B', 'Phục vụ', 'Ca sáng', 'staff1', '$2a$10$eokvvzdOnL.V6Y.6L3K2ueH/N8k.SndS7q.B1o4.q8S.SndS7q.B1');

INSERT INTO staff (id, fullName, role, shift, username, password) 
VALUES (3, 'Lê Văn C', 'Phục vụ', 'Ca chiều', 'staff2', '$2a$10$eokvvzdOnL.V6Y.6L3K2ueH/N8k.SndS7q.B1o4.q8S.SndS7q.B1');

INSERT INTO staff (id, fullName, role, shift, username, password) 
VALUES (4, 'Phạm Thị D', 'Thu ngân', 'Ca tối', 'cashier', '$2a$10$eokvvzdOnL.V6Y.6L3K2ueH/N8k.SndS7q.B1o4.q8S.SndS7q.B1');

INSERT INTO staff (id, fullName, role, shift, username, password) 
VALUES (5, 'Hoàng Văn E', 'Bếp', 'Ca sáng', 'chef', '$2a$10$eokvvzdOnL.V6Y.6L3K2ueH/N8k.SndS7q.B1o4.q8S.SndS7q.B1');

UPDATE staff_SEQ SET next_val = 6;