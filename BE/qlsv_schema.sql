-- =====================================================================
--  HỆ THỐNG QUẢN LÝ SINH VIÊN (QLSV) – Nhóm 6 CE02 – Môn Cơ sở dữ liệu
--  Cấu trúc CSDL chuẩn: 9 bảng, khóa chính, khóa ngoại, ràng buộc toàn vẹn
--  DBMS: MySQL 8.0+
--  Bao gồm:
--    1. KHOA
--    2. GIANGVIEN
--    3. LOP
--    4. SINHVIEN (kèm cột TrangThai: DANG_HOC, BAO_LUU, TOT_NGHIEP, BUOC_THOI_HOC)
--    5. MONHOC
--    6. HOCKY
--    7. KETQUA (Bảng điểm CC, GK, CK)
--    8. TAIKHOAN (Người dùng, phân quyền JWT: ADMIN, GIANGVIEN, SINHVIEN)
--    9. PHANCONG (Phân công giảng dạy, căn cứ phân quyền nhập điểm)
-- =====================================================================

DROP DATABASE IF EXISTS qlsv;
CREATE DATABASE qlsv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qlsv;

-- ---------------------------------------------------------------------
-- 1. KHOA (Quản lý các khoa đào tạo)
-- ---------------------------------------------------------------------
CREATE TABLE KHOA (
    MaKhoa      VARCHAR(10)  NOT NULL,
    TenKhoa     VARCHAR(100) NOT NULL,
    CONSTRAINT pk_khoa     PRIMARY KEY (MaKhoa),
    CONSTRAINT uq_khoa_ten UNIQUE (TenKhoa)
);

-- ---------------------------------------------------------------------
-- 2. GIANGVIEN (Khoa 1 – N Giảng viên, bắt buộc)
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
        ON DELETE RESTRICT                     -- Không xóa khoa khi vẫn còn giảng viên
);

-- ---------------------------------------------------------------------
-- 3. LOP (Thuộc: Khoa 1 – N Lớp, bắt buộc; Cố vấn: GV 1 – N Lớp, không bắt buộc)
-- ---------------------------------------------------------------------
CREATE TABLE LOP (
    MaLop       VARCHAR(15)  NOT NULL,         -- VD: D24CQCE02-B
    TenLop      VARCHAR(100) NOT NULL,
    KhoaHoc     INT          NOT NULL,         -- Năm nhập học, VD: 2024
    MaKhoa      VARCHAR(10)  NOT NULL,
    MaGVCoVan   VARCHAR(10)  NULL,             -- Lớp có thể chưa có cố vấn
    CONSTRAINT pk_lop          PRIMARY KEY (MaLop),
    CONSTRAINT ck_lop_khoahoc  CHECK (KhoaHoc BETWEEN 2000 AND 2100),
    CONSTRAINT fk_lop_khoa     FOREIGN KEY (MaKhoa)    REFERENCES KHOA(MaKhoa)
        ON DELETE RESTRICT,                    -- Không xóa khoa khi còn lớp
    CONSTRAINT fk_lop_covan    FOREIGN KEY (MaGVCoVan) REFERENCES GIANGVIEN(MaGV)
        ON DELETE SET NULL                     -- Xóa giảng viên -> lớp để trống cố vấn
);

-- ---------------------------------------------------------------------
-- 4. SINHVIEN (Lớp 1 – N Sinh viên, bắt buộc)
--    Có thuộc tính TrangThai: DANG_HOC, BAO_LUU, TOT_NGHIEP, BUOC_THOI_HOC
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
    TrangThai   VARCHAR(20)  NOT NULL DEFAULT 'DANG_HOC',
    CONSTRAINT pk_sinhvien           PRIMARY KEY (MaSV),
    CONSTRAINT uq_sinhvien_email     UNIQUE (Email),
    CONSTRAINT ck_sinhvien_gioitinh  CHECK (GioiTinh IN ('Nam', 'Nữ')),
    CONSTRAINT ck_sinhvien_trangthai CHECK (TrangThai IN ('DANG_HOC', 'BAO_LUU', 'TOT_NGHIEP', 'BUOC_THOI_HOC')),
    CONSTRAINT fk_sinhvien_lop       FOREIGN KEY (MaLop) REFERENCES LOP(MaLop)
        ON DELETE RESTRICT                      -- Không xóa lớp khi còn sinh viên
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
-- ---------------------------------------------------------------------
CREATE TABLE HOCKY (
    MaHK        VARCHAR(10)  NOT NULL,         -- VD: 2024-1
    NamHoc      VARCHAR(9)   NOT NULL,         -- VD: 2024-2025
    Ky          INT          NOT NULL,         -- 1, 2 hoặc 3 (học kỳ hè)
    CONSTRAINT pk_hocky        PRIMARY KEY (MaHK),
    CONSTRAINT uq_hocky_namky  UNIQUE (NamHoc, Ky),
    CONSTRAINT ck_hocky_ky     CHECK (Ky BETWEEN 1 AND 3)
);

-- ---------------------------------------------------------------------
-- 7. KETQUA – THỰC THỂ YẾU (Kết quả học tập từng học phần)
--    Khóa chính liên hợp: (MaSV, MaMH, MaHK)
-- ---------------------------------------------------------------------
CREATE TABLE KETQUA (
    MaSV        VARCHAR(15)  NOT NULL,
    MaMH        VARCHAR(15)  NOT NULL,
    MaHK        VARCHAR(10)  NOT NULL,
    DiemCC      DECIMAL(4,2) NULL,             -- Điểm chuyên cần (10%)
    DiemGK      DECIMAL(4,2) NULL,             -- Điểm giữa kỳ (30%)
    DiemCK      DECIMAL(4,2) NULL,             -- Điểm cuối kỳ (60%)
    CONSTRAINT pk_ketqua        PRIMARY KEY (MaSV, MaMH, MaHK),
    CONSTRAINT ck_ketqua_cc     CHECK (DiemCC BETWEEN 0 AND 10),
    CONSTRAINT ck_ketqua_gk     CHECK (DiemGK BETWEEN 0 AND 10),
    CONSTRAINT ck_ketqua_ck     CHECK (DiemCK BETWEEN 0 AND 10),
    CONSTRAINT fk_ketqua_sv     FOREIGN KEY (MaSV) REFERENCES SINHVIEN(MaSV)
        ON DELETE CASCADE,                     -- Xóa sinh viên -> xóa điểm liên quan
    CONSTRAINT fk_ketqua_mh     FOREIGN KEY (MaMH) REFERENCES MONHOC(MaMH)
        ON DELETE RESTRICT,                    -- Không xóa môn đã có sinh viên học
    CONSTRAINT fk_ketqua_hk     FOREIGN KEY (MaHK) REFERENCES HOCKY(MaHK)
        ON DELETE RESTRICT                     -- Không xóa học kỳ đã có điểm
);

-- ---------------------------------------------------------------------
-- 8. TAIKHOAN (Người dùng và phân quyền hệ thống JWT)
--    Hỗ trợ 3 quyền: ADMIN, GIANGVIEN, SINHVIEN
-- ---------------------------------------------------------------------
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
    CONSTRAINT fk_user_sv     FOREIGN KEY (MaSV) REFERENCES SINHVIEN(MaSV)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_gv     FOREIGN KEY (MaGV) REFERENCES GIANGVIEN(MaGV)
        ON DELETE CASCADE
);

-- ---------------------------------------------------------------------
-- 9. PHANCONG (Phân công giảng dạy, làm căn cứ phân quyền nhập điểm)
--    Ràng buộc UNIQUE (MaMH, MaLop, MaHK): 1 lớp trong 1 kỳ, 1 môn chỉ 1 GV phụ trách
-- ---------------------------------------------------------------------
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

-- =====================================================================
-- DỮ LIỆU KHỞI TẠO BAN ĐẦU (SEED DATA MẪU)
-- =====================================================================

-- 1. KHOA
INSERT INTO KHOA (MaKhoa, TenKhoa) VALUES
('CNTT', 'Công nghệ Thông tin 1'),
('VT',   'Viễn thông 1'),
('DTVT', 'Điện tử 1'),
('ATTT', 'An toàn Thông tin'),
('CB',   'Cơ bản 1');

-- 2. GIANGVIEN
INSERT INTO GIANGVIEN (MaGV, HoTen, Email, SoDienThoai, MaKhoa) VALUES
('GV01', 'TS. Trần Văn An',       'an.tv@qlsv.edu.vn',    '0901234567', 'CNTT'),
('GV02', 'ThS. Lê Thị Bình',      'binh.lt@qlsv.edu.vn',  '0912345678', 'CNTT'),
('GV03', 'PGS.TS. Phạm Quốc Cường','cuong.pq@qlsv.edu.vn', '0923456789', 'VT'),
('GV04', 'ThS. Hoàng Đức Duy',    'duy.hd@qlsv.edu.vn',   '0934567890', 'DTVT');

-- 3. LOP
INSERT INTO LOP (MaLop, TenLop, KhoaHoc, MaKhoa, MaGVCoVan) VALUES
('D24CQCE02-B', 'Kỹ thuật Máy tính 02 - Khóa 2024',   2024, 'CNTT', 'GV01'),
('D24CQCN01-B', 'Công nghệ Thông tin 01 - Khóa 2024', 2024, 'CNTT', 'GV02'),
('D24CQVT01-B', 'Viễn thông 01 - Khóa 2024',          2024, 'VT',   'GV03'),
('D24CQDT01-B', 'Điện tử 01 - Khóa 2024',             2024, 'DTVT', 'GV04'),
('D24CQAT01-B', 'An toàn Thông tin 01 - Khóa 2024',    2024, 'ATTT', NULL);

-- 4. SINHVIEN
INSERT INTO SINHVIEN (MaSV, HoTen, NgaySinh, GioiTinh, DiaChi, Email, SoDienThoai, MaLop, TrangThai) VALUES
('B24DCCE001', 'Nguyễn Hoàng Nam', '2006-03-15', 'Nam', 'Hà Nội',     'nam.nh@qlsv.edu.vn', '0981112233', 'D24CQCE02-B', 'DANG_HOC'),
('B24DCCE002', 'Trần Thị Mai Lan', '2006-08-20', 'Nữ',  'Hải Phòng', 'lan.ttm@qlsv.edu.vn', '0982223344', 'D24CQCE02-B', 'DANG_HOC'),
('B24DCCN001', 'Lê Văn Hùng',      '2006-11-05', 'Nam', 'Đà Nẵng',   'hung.lv@qlsv.edu.vn', '0983334455', 'D24CQCN01-B', 'DANG_HOC'),
('B24DCCN002', 'Phạm Thu Thảo',    '2006-01-10', 'Nữ',  'Nam Định',  'thao.pt@qlsv.edu.vn', '0984445566', 'D24CQCN01-B', 'DANG_HOC'),
('B24DCVT001', 'Vũ Đình Khoa',     '2006-05-12', 'Nam', 'Quảng Ninh', 'khoa.vd@qlsv.edu.vn', '0985556677', 'D24CQVT01-B', 'DANG_HOC');

-- 5. MONHOC
INSERT INTO MONHOC (MaMH, TenMH, SoTinChi) VALUES
('INT1313', 'Cơ sở dữ liệu',                   3),
('INT1306', 'Cấu trúc dữ liệu và giải thuật',   3),
('INT1155', 'Tin học đại cương',                3),
('BAS1201', 'Đại số tuyến tính',                3),
('BAS1203', 'Giải tích 1',                      3),
('INT1434', 'Lập trình Web',                    3);

-- 6. HOCKY
INSERT INTO HOCKY (MaHK, NamHoc, Ky) VALUES
('2024-1', '2024-2025', 1),
('2024-2', '2024-2025', 2),
('2024-3', '2024-2025', 3),
('2025-1', '2025-2026', 1),
('2025-2', '2025-2026', 2);

-- 7. KETQUA
INSERT INTO KETQUA (MaSV, MaMH, MaHK, DiemCC, DiemGK, DiemCK) VALUES
('B24DCCE001', 'INT1313', '2024-1', 9.00, 8.50, 9.00),
('B24DCCE001', 'INT1306', '2024-1', 8.00, 7.00, 8.00),
('B24DCCE001', 'BAS1201', '2024-1', 9.50, 9.00, 9.50),
('B24DCCE002', 'INT1313', '2024-1', 7.00, 6.00, 5.50),
('B24DCCN001', 'INT1313', '2024-1', 8.50, 8.00, 8.50);

-- 8. TAIKHOAN
-- Mật khẩu BCrypt:
--   admin123 -> $2a$10$TDDXAPoO2rsQc6FzJJW6/OxL9M24roJKYlyr800G5SC6vqUzwlvCO
--   123456   -> $2a$10$wK1k6YfR29M8rV5O1dYtNu6HkXzJgO/WnS5tG4aD3qG9i6b0.t7V6 (hoặc dùng admin123 cho tiện)
INSERT INTO TAIKHOAN (Username, Password, Role, MaSV, MaGV, TrangThai) VALUES
('admin',      '$2a$10$TDDXAPoO2rsQc6FzJJW6/OxL9M24roJKYlyr800G5SC6vqUzwlvCO', 'ADMIN',     NULL,          NULL,   TRUE),
('gv01',       '$2a$10$TDDXAPoO2rsQc6FzJJW6/OxL9M24roJKYlyr800G5SC6vqUzwlvCO', 'GIANGVIEN', NULL,          'GV01', TRUE),
('b24dcce001', '$2a$10$TDDXAPoO2rsQc6FzJJW6/OxL9M24roJKYlyr800G5SC6vqUzwlvCO', 'SINHVIEN',  'B24DCCE001', NULL,   TRUE);

-- 9. PHANCONG
INSERT INTO PHANCONG (MaGV, MaMH, MaLop, MaHK) VALUES
('GV01', 'INT1313', 'D24CQCE02-B', '2024-1'),
('GV01', 'INT1306', 'D24CQCE02-B', '2024-1'),
('GV02', 'INT1313', 'D24CQCN01-B', '2024-1');
