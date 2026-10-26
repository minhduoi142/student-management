-- ==============================================================================
-- DATABASE MIGRATION SCRIPT: CẬP NHẬT SCHEMA CHO HỆ THỐNG QLSV
-- 1. Cập nhật bảng SINHVIEN: Thêm cột TrangThai
-- 2. Tạo bảng TAIKHOAN: Quản lý người dùng, phân quyền và liên kết SV / GV
-- 3. Tạo bảng PHANCONG: Phân công giảng dạy và phân quyền nhập điểm
-- ==============================================================================

-- 1. Cập nhật bảng SINHVIEN
-- Các giá trị Enum: 'DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP', 'BUOC_THOI_HOC'
ALTER TABLE SINHVIEN 
ADD COLUMN TrangThai VARCHAR(20) NOT NULL DEFAULT 'DANG_HOC';

-- 2. Tạo bảng TAIKHOAN
CREATE TABLE TAIKHOAN (
    Id          BIGINT AUTO_INCREMENT NOT NULL,
    Username    VARCHAR(50)           NOT NULL,
    Password    VARCHAR(255)          NOT NULL,
    Role        VARCHAR(20)           NOT NULL,
    MaSV        VARCHAR(15)           NULL,
    MaGV        VARCHAR(10)           NULL,
    TrangThai   BOOLEAN               NOT NULL DEFAULT TRUE,
    CreatedAt   DATETIME              NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_taikhoan    PRIMARY KEY (Id),
    CONSTRAINT uq_username    UNIQUE (Username),
    CONSTRAINT uq_user_sv     UNIQUE (MaSV),
    CONSTRAINT uq_user_gv     UNIQUE (MaGV),
    CONSTRAINT ck_user_role   CHECK (Role IN ('ADMIN', 'GIANGVIEN', 'SINHVIEN')),
    CONSTRAINT fk_user_sv     FOREIGN KEY (MaSV) REFERENCES SINHVIEN(MaSV) ON DELETE CASCADE,
    CONSTRAINT fk_user_gv     FOREIGN KEY (MaGV) REFERENCES GIANGVIEN(MaGV) ON DELETE CASCADE
);

-- 3. Tạo bảng PHANCONG
CREATE TABLE PHANCONG (
    MaPC        BIGINT AUTO_INCREMENT NOT NULL,
    MaGV        VARCHAR(10)           NOT NULL,
    MaMH        VARCHAR(15)           NOT NULL,
    MaLop       VARCHAR(15)           NOT NULL,
    MaHK        VARCHAR(10)           NOT NULL,
    CONSTRAINT pk_phancong    PRIMARY KEY (MaPC),
    CONSTRAINT uq_phancong    UNIQUE (MaMH, MaLop, MaHK),
    CONSTRAINT fk_pc_gv       FOREIGN KEY (MaGV)  REFERENCES GIANGVIEN(MaGV) ON DELETE RESTRICT,
    CONSTRAINT fk_pc_mh       FOREIGN KEY (MaMH)  REFERENCES MONHOC(MaMH)    ON DELETE RESTRICT,
    CONSTRAINT fk_pc_lop      FOREIGN KEY (MaLop) REFERENCES LOP(MaLop)       ON DELETE RESTRICT,
    CONSTRAINT fk_pc_hk       FOREIGN KEY (MaHK)  REFERENCES HOCKY(MaHK)     ON DELETE RESTRICT
);
