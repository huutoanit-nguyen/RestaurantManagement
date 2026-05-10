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

UPDATE staff_SEQ SET next_val = 6;