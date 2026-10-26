-- =====================================================================
--  HỆ THỐNG QUẢN LÝ SINH VIÊN – Nhóm 6 CE02 – Môn Cơ sở dữ liệu
--  Tạo cấu trúc CSDL: 7 bảng, khóa chính, khóa ngoại, ràng buộc
--  DBMS: MySQL 8.0+
--  Chạy trong MySQL Workbench: mở file, bấm ⚡ (chạy toàn bộ, không bôi đen)
-- =====================================================================

DROP DATABASE IF EXISTS qlsv;
CREATE DATABASE qlsv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qlsv;

-- ---------------------------------------------------------------------
-- 1. KHOA
-- ---------------------------------------------------------------------
CREATE TABLE KHOA (
    MaKhoa      VARCHAR(10)  NOT NULL,
    TenKhoa     VARCHAR(100) NOT NULL,
    CONSTRAINT pk_khoa     PRIMARY KEY (MaKhoa),
    CONSTRAINT uq_khoa_ten UNIQUE (TenKhoa)
);

-- ---------------------------------------------------------------------
-- 2. GIANGVIEN   (Công tác: Khoa 1 – N Giảng viên, bắt buộc)
-- ---------------------------------------------------------------------
CREATE TABLE GIANGVIEN (
    MaGV        VARCHAR(10)  NOT NULL,
    HoTen       VARCHAR(100) NOT NULL,
    Email       VARCHAR(100) NULL,
    SoDienThoai VARCHAR(15)  NULL,
    MaKhoa      VARCHAR(10)  NOT NULL,
    CONSTRAINT pk_giangvien       PRIMARY KEY (MaGV),
    CONSTRAINT uq_giangvien_email UNIQUE (Email),
    CONSTRAINT fk_giangvien_khoa  FOREIGN KEY (MaKhoa) REFERENCES KHOA(MaKhoa)
        ON DELETE RESTRICT                     -- không xóa khoa còn giảng viên
);

-- ---------------------------------------------------------------------
-- 3. LOP   (Thuộc: Khoa 1 – N Lớp, bắt buộc;
--           Cố vấn: Giảng viên 1 – N Lớp, không bắt buộc)
-- ---------------------------------------------------------------------
CREATE TABLE LOP (
    MaLop       VARCHAR(15)  NOT NULL,         -- VD: D24CQCE02-B
    TenLop      VARCHAR(100) NOT NULL,
    KhoaHoc     INT          NOT NULL,         -- năm nhập học, VD: 2024
    MaKhoa      VARCHAR(10)  NOT NULL,
    MaGVCoVan   VARCHAR(10)  NULL,             -- lớp có thể chưa có cố vấn
    CONSTRAINT pk_lop          PRIMARY KEY (MaLop),
    CONSTRAINT ck_lop_khoahoc  CHECK (KhoaHoc BETWEEN 2000 AND 2100),
    CONSTRAINT fk_lop_khoa     FOREIGN KEY (MaKhoa)    REFERENCES KHOA(MaKhoa)
        ON DELETE RESTRICT,                    -- không xóa khoa còn lớp
    CONSTRAINT fk_lop_covan    FOREIGN KEY (MaGVCoVan) REFERENCES GIANGVIEN(MaGV)
        ON DELETE SET NULL                     -- xóa giảng viên -> lớp chưa có cố vấn
);

-- ---------------------------------------------------------------------
-- 4. SINHVIEN   (Học: Lớp 1 – N Sinh viên, bắt buộc)
-- ---------------------------------------------------------------------
CREATE TABLE SINHVIEN (
    MaSV        VARCHAR(15)  NOT NULL,         -- VD: B24DCCE001
    HoTen       VARCHAR(100) NOT NULL,
    NgaySinh    DATE         NOT NULL,
    GioiTinh    VARCHAR(5)   NOT NULL,
    DiaChi      VARCHAR(255) NULL,
    Email       VARCHAR(100) NULL,
    SoDienThoai VARCHAR(15)  NULL,
    MaLop       VARCHAR(15)  NOT NULL,
    CONSTRAINT pk_sinhvien          PRIMARY KEY (MaSV),
    CONSTRAINT uq_sinhvien_email    UNIQUE (Email),
    CONSTRAINT ck_sinhvien_gioitinh CHECK (GioiTinh IN ('Nam', 'Nữ')),
    CONSTRAINT fk_sinhvien_lop      FOREIGN KEY (MaLop) REFERENCES LOP(MaLop)
        ON DELETE RESTRICT                     -- không xóa lớp còn sinh viên
);

-- ---------------------------------------------------------------------
-- 5. MONHOC
-- ---------------------------------------------------------------------
CREATE TABLE MONHOC (
    MaMH        VARCHAR(15)  NOT NULL,         -- VD: INT1313
    TenMH       VARCHAR(150) NOT NULL,
    SoTinChi    INT          NOT NULL,
    CONSTRAINT pk_monhoc        PRIMARY KEY (MaMH),
    CONSTRAINT ck_monhoc_tinchi CHECK (SoTinChi > 0)
);

-- ---------------------------------------------------------------------
-- 6. HOCKY
--    Không có cột TenHocKy (ghép được từ NamHoc + Ky -> tránh phụ thuộc bắc cầu)
-- ---------------------------------------------------------------------
CREATE TABLE HOCKY (
    MaHK        VARCHAR(10)  NOT NULL,         -- VD: 2025-1
    NamHoc      VARCHAR(9)   NOT NULL,         -- VD: 2025-2026
    Ky          INT          NOT NULL,         -- 1, 2 hoặc 3 (học kỳ hè)
    CONSTRAINT pk_hocky        PRIMARY KEY (MaHK),
    CONSTRAINT uq_hocky_namky  UNIQUE (NamHoc, Ky),
    CONSTRAINT ck_hocky_ky     CHECK (Ky BETWEEN 1 AND 3)
);

-- ---------------------------------------------------------------------
-- 7. KETQUA – THỰC THỂ YẾU
--    Khóa chính mượn từ 3 thực thể chủ: (MaSV, MaMH, MaHK)
--    Liên kết xác định: Có (Sinh viên), Của (Môn học), Trong (Học kỳ)
--    Điểm tổng là thuộc tính dẫn xuất -> KHÔNG lưu, tính trong view
-- ---------------------------------------------------------------------
CREATE TABLE KETQUA (
    MaSV        VARCHAR(15)  NOT NULL,
    MaMH        VARCHAR(15)  NOT NULL,
    MaHK        VARCHAR(10)  NOT NULL,
    DiemCC      DECIMAL(4,2) NULL,             -- NULL = chưa có điểm
    DiemGK      DECIMAL(4,2) NULL,
    DiemCK      DECIMAL(4,2) NULL,
    CONSTRAINT pk_ketqua        PRIMARY KEY (MaSV, MaMH, MaHK),
    CONSTRAINT ck_ketqua_cc     CHECK (DiemCC BETWEEN 0 AND 10),
    CONSTRAINT ck_ketqua_gk     CHECK (DiemGK BETWEEN 0 AND 10),
    CONSTRAINT ck_ketqua_ck     CHECK (DiemCK BETWEEN 0 AND 10),
    CONSTRAINT fk_ketqua_sv     FOREIGN KEY (MaSV) REFERENCES SINHVIEN(MaSV)
        ON DELETE CASCADE,                     -- xóa sinh viên -> xóa luôn kết quả
    CONSTRAINT fk_ketqua_mh     FOREIGN KEY (MaMH) REFERENCES MONHOC(MaMH)
        ON DELETE RESTRICT,                    -- không xóa môn đã có điểm
    CONSTRAINT fk_ketqua_hk     FOREIGN KEY (MaHK) REFERENCES HOCKY(MaHK)
        ON DELETE RESTRICT                     -- không xóa học kỳ đã có điểm
);
