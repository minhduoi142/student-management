-- =====================================================================
-- Dữ liệu mẫu ban đầu cho Phase 1: KHOA, MONHOC, HOCKY
-- =====================================================================

-- 1. Bảng KHOA
INSERT INTO KHOA (MaKhoa, TenKhoa) VALUES
('CNTT', 'Công nghệ Thông tin 1'),
('VT', 'Viễn thông 1'),
('DTVT', 'Điện tử 1'),
('ATTT', 'An toàn Thông tin'),
('CB', 'Cơ bản 1')
ON DUPLICATE KEY UPDATE TenKhoa = VALUES(TenKhoa);

-- 2. Bảng MONHOC
INSERT INTO MONHOC (MaMH, TenMH, SoTinChi) VALUES
('INT1313', 'Cơ sở dữ liệu', 3),
('INT1306', 'Cấu trúc dữ liệu và giải thuật', 3),
('INT1155', 'Tin học đại cương', 3),
('BAS1201', 'Đại số tuyến tính', 3),
('BAS1203', 'Giải tích 1', 3),
('INT1434', 'Lập trình Web', 3)
ON DUPLICATE KEY UPDATE TenMH = VALUES(TenMH), SoTinChi = VALUES(SoTinChi);

-- 3. Bảng HOCKY
INSERT INTO HOCKY (MaHK, NamHoc, Ky) VALUES
('2024-1', '2024-2025', 1),
('2024-2', '2024-2025', 2),
('2024-3', '2024-2025', 3),
('2025-1', '2025-2026', 1),
('2025-2', '2025-2026', 2)
ON DUPLICATE KEY UPDATE NamHoc = VALUES(NamHoc), Ky = VALUES(Ky);
