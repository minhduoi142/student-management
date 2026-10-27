-- ==============================================================================
-- DATABASE MIGRATION SCRIPT: CẬP NHẬT SCHEMA CHO HỆ THỐNG QLSV
-- Bổ sung cột AvatarUrl để tích hợp MinIO Object Storage
-- ==============================================================================

-- 1. Bổ sung AvatarUrl vào bảng TAIKHOAN (Admin, Giảng viên, Sinh viên)
ALTER TABLE TAIKHOAN 
ADD COLUMN AvatarUrl VARCHAR(500) NULL;

-- 2. Bổ sung AvatarUrl vào bảng SINHVIEN (Ảnh thẻ học sinh, hiển thị hồ sơ & bảng danh sách)
ALTER TABLE SINHVIEN 
ADD COLUMN AvatarUrl VARCHAR(500) NULL;

-- 3. Bổ sung AvatarUrl vào bảng GIANGVIEN (Ảnh cán bộ giảng dạy, hiển thị hồ sơ & bảng phân công)
ALTER TABLE GIANGVIEN 
ADD COLUMN AvatarUrl VARCHAR(500) NULL;
