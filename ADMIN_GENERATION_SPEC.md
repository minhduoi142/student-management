# 📘 TÀI LIỆU ĐẶC TẢ QUẢN TRỊ VIÊN (ADMIN GENERATION SPEC)
## HỆ THỐNG QUẢN LÝ SINH VIÊN (SPRING BOOT 3 + NEXT.JS)

> **Mục đích tài liệu**: Tài liệu này đóng vai trò là bản đặc tả kỹ thuật toàn diện (Complete Blueprint & Prompt Guide) chuẩn bị sẵn cho AI Agent hoặc Developer. Khi cần sinh mới hoặc nâng cấp trang **Quản trị Sinh viên (Students Management)** hoặc **Quản trị Giảng viên & Phân công (Lecturers & Assignment Management)**, chỉ cần import tài liệu này vào context để gen code 1-chạm mà không lo thiếu sót nghiệp vụ hoặc sai lệch cấu trúc dữ liệu.

---

## 🗄️ 1. TỔNG QUAN LƯỢC ĐỒ CSDL LIÊN QUAN (9 BẢNG)

* **`SINHVIEN`**: `MaSV` (PK), `HoTen`, `NgaySinh`, `GioiTinh`, `DiaChi`, `Email` (UQ), `SoDienThoai`, `MaLop` (FK -> `LOP`), `TrangThai` (`DANG_HOC`, `BAO_LUU`, `TOT_NGHIEP`, `BUOC_THOI_HOC`).
* **`GIANGVIEN`**: `MaGV` (PK), `HoTen`, `Email` (UQ), `SoDienThoai`, `MaKhoa` (FK -> `KHOA`).
* **`LOP`**: `MaLop` (PK), `TenLop`, `KhoaHoc`, `MaKhoa` (FK -> `KHOA`), `MaGVCoVan` (FK -> `GIANGVIEN`, NULLABLE).
* **`KHOA`**: `MaKhoa` (PK), `TenKhoa` (UQ).
* **`MONHOC`**: `MaMH` (PK), `TenMH`, `SoTinChi`.
* **`HOCKY`**: `MaHK` (PK), `NamHoc`, `Ky`.
* **`KETQUA`**: (`MaSV`, `MaMH`, `MaHK`) (Composite PK), `DiemCC`, `DiemGK`, `DiemCK`.
* **`TAIKHOAN`**: `Id` (PK), `Username` (UQ), `Password` (BCrypt), `Role` (`ADMIN`, `GIANGVIEN`, `SINHVIEN`), `MaSV` (FK/UQ), `MaGV` (FK/UQ), `TrangThai` (Boolean), `CreatedAt`.
* **`PHANCONG`**: `MaPC` (PK), `MaGV` (FK), `MaMH` (FK), `MaLop` (FK), `MaHK` (FK), `UNIQUE(MaMH, MaLop, MaHK)`.

---

## 👨‍🎓 2. ĐẶC TẢ TRANG QUẢN TRỊ SINH VIÊN (STUDENT MANAGEMENT)

### 2.1. Mục Tiêu & Luồng Nghiệp Vụ
1. **Tìm kiếm & Lọc Đa Chiều (Advanced Filtering)**:
   * Tìm kiếm tức thời (Debounced Search) theo Họ tên hoặc Mã sinh viên.
   * Lọc theo Khoa quản lý (`maKhoa`). Khi chọn Khoa, tự động lọc danh sách Lớp thuộc Khoa đó.
   * Lọc theo Lớp học (`maLop`).
   * Lọc theo Trạng thái học tập (`trangThai`): `DANG_HOC` (Đang học), `BAO_LUU` (Bảo lưu), `TOT_NGHIEP` (Tốt nghiệp), `BUOC_THOI_HOC` (Buộc thôi học).
   * Phân trang máy chủ (`PageResponse<SinhVienResponse>`), tùy chọn sắp xếp.
2. **Quản lý Hồ Sơ Sinh Viên (CRUD & Lifecycle)**:
   * **Thêm mới**: Modal Form nhập đầy đủ thông tin: Mã SV (bắt buộc, duy nhất, regex theo chuẩn trường), Họ tên, Ngày sinh (quá khứ), Giới tính, Địa chỉ, Email (duy nhất), SĐT, Lớp, Trạng thái mặc định `DANG_HOC`.
   * **Cập nhật**: Sửa hồ sơ, cho phép chuyển lớp, cập nhật trạng thái học tập (ví dụ SV làm thủ tục bảo lưu hoặc tốt nghiệp).
   * **Xóa sinh viên**: Modal xác nhận cảnh báo nguy hiểm (Xóa SV sẽ cascade xóa điểm thi trong `KETQUA` và tài khoản trong `TAIKHOAN`).
3. **Quản lý Tài Khoản Đăng Nhập Của Sinh Viên**:
   * Xem trạng thái tài khoản đăng nhập (Đã kích hoạt / Bị khóa).
   * Cấp/Khóa tài khoản sinh viên: Gọi API bật/tắt `trangThai` tài khoản.
   * Đặt lại mật khẩu (Reset Password): Đặt lại về mật khẩu mặc định (ví dụ: ngày sinh dạng `ddMMyyyy` hoặc `123456`).
4. **Import & Export Dữ Liệu**:
   * **Xuất file**: Export danh sách sinh viên đang hiển thị hoặc toàn bộ ra file CSV / Excel.
   * **Nhập file (Excel/CSV)**: Modal kéo thả file `.xlsx` / `.csv`, tải template mẫu, xem trước dữ liệu (preview trước khi lưu), hiển thị chi tiết các dòng bị lỗi (trùng mã SV, sai mã lớp...).
5. **Tiện ích mở rộng**:
   * Nút "Xem Bảng Điểm Nhanh": Mở Drawer hiển thị bảng điểm và GPA hiện tại của sinh viên mà không cần chuyển trang.

### 2.2. Hợp Đồng API (Backend Endpoints)
| Method | Endpoint | Quyền (Security) | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/sinh-vien` | `ADMIN`, `GIANGVIEN` | Lấy danh sách SV phân trang (`keyword`, `maLop`, `maKhoa`, `page`, `size`, `sort`) |
| `GET` | `/api/v1/sinh-vien/{maSV}` | `ADMIN`, `GIANGVIEN`, `SINHVIEN` (owner) | Lấy chi tiết hồ sơ 1 sinh viên |
| `POST` | `/api/v1/sinh-vien` | `ADMIN` | Thêm mới 1 sinh viên (tự động tạo tài khoản tương ứng) |
| `PUT` | `/api/v1/sinh-vien/{maSV}` | `ADMIN` | Cập nhật toàn bộ thông tin sinh viên |
| `PATCH` | `/api/v1/sinh-vien/{maSV}/trang-thai` | `ADMIN` | Đổi trạng thái học tập (`DANG_HOC`, `BAO_LUU`,...) |
| `DELETE` | `/api/v1/sinh-vien/{maSV}` | `ADMIN` | Xóa sinh viên |
| `POST` | `/api/v1/sinh-vien/import` | `ADMIN` | Import sinh viên hàng loạt từ file Excel/CSV |
| `POST` | `/api/v1/admin/tai-khoan/sinh-vien/{maSV}/reset-password` | `ADMIN` | Reset mật khẩu tài khoản sinh viên về mặc định |
| `PATCH` | `/api/v1/admin/tai-khoan/sinh-vien/{maSV}/toggle-status` | `ADMIN` | Khóa / Mở khóa tài khoản đăng nhập của sinh viên |

---

## 👩‍🏫 3. ĐẶC TẢ TRANG QUẢN TRỊ GIẢNG VIÊN & PHÂN CÔNG (LECTURERS & ASSIGNMENT)

### 3.1. Mục Tiêu & Luồng Nghiệp Vụ
1. **Quản trị Thông Tin Giảng Viên (Lecturer Management)**:
   * Danh sách giảng viên phân trang / bảng tìm kiếm theo Mã GV, Họ tên, Email, SĐT, Khoa.
   * Thêm mới Giảng viên: Nhập Mã GV (ví dụ `GV05`), Họ tên, Email (duy nhất), SĐT, chọn Khoa công tác.
   * Cập nhật thông tin giảng viên.
   * Xóa giảng viên: Kiểm tra điều kiện không cho xóa nếu giảng viên đang làm Cố vấn học tập cho lớp (`LOP.MaGVCoVan`) hoặc đang có phân công giảng dạy (`PHANCONG.MaGV`).
2. **Quản trị Phân Công Giảng Dạy (`PHANCONG`)**:
   * Xem tab "Phân công giảng dạy" của từng giảng viên hoặc xem toàn trường theo từng Học kỳ (`MaHK`).
   * **Tạo phân công mới**: Chọn Giảng viên (`MaGV`), Môn học (`MaMH`), Lớp học (`MaLop`), Học kỳ (`MaHK`).
     * Ràng buộc: `UNIQUE(MaMH, MaLop, MaHK)` - nếu lớp đó trong kỳ đó đã có người dạy môn đó thì báo lỗi xung đột.
   * **Hủy phân công**: Xóa bản ghi phân công khỏi hệ thống.
3. **Quản lý Tài Khoản Đăng Nhập Của Giảng Viên**:
   * Cấp tài khoản mới cho giảng viên (Role: `GIANGVIEN`).
   * Reset mật khẩu hoặc tạm khóa tài khoản giảng viên.
4. **Import Danh Sách Giảng Viên**:
   * Hỗ trợ file Excel mẫu với các cột: `Mã GV`, `Họ và tên`, `Email`, `Số điện thoại`, `Mã khoa`.

### 3.2. Hợp Đồng API (Backend Endpoints)
| Method | Endpoint | Quyền (Security) | Mô tả |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/giang-vien` | `ADMIN`, `GIANGVIEN` | Danh sách giảng viên (hỗ trợ lọc theo `maKhoa`, tìm kiếm `keyword`) |
| `GET` | `/api/v1/giang-vien/{maGV}` | `ADMIN`, `GIANGVIEN` | Chi tiết 1 giảng viên |
| `POST` | `/api/v1/giang-vien` | `ADMIN` | Thêm mới giảng viên (tùy chọn tự tạo tài khoản) |
| `PUT` | `/api/v1/giang-vien/{maGV}` | `ADMIN` | Cập nhật giảng viên |
| `DELETE` | `/api/v1/giang-vien/{maGV}` | `ADMIN` | Xóa giảng viên |
| `GET` | `/api/v1/phan-cong` | `ADMIN`, `GIANGVIEN` | Danh sách phân công (`maGV`, `maHK`, `maLop`) |
| `POST` | `/api/v1/phan-cong` | `ADMIN` | Tạo phân công giảng dạy mới |
| `DELETE` | `/api/v1/phan-cong/{maPC}` | `ADMIN` | Hủy phân công giảng dạy |
| `POST` | `/api/v1/giang-vien/import` | `ADMIN` | Import giảng viên từ Excel/CSV |
| `POST` | `/api/v1/admin/tai-khoan/giang-vien/{maGV}/reset-password` | `ADMIN` | Reset mật khẩu tài khoản giảng viên |

---

## 💻 4. KIẾN TRÚC UI FRONTEND (NEXT.JS 16 / REACT 19 / TAILWIND)

### 4.1. Cấu Trúc File Đề Xuất
```text
FE/
├── components/
│   ├── students-view.tsx           # Trang Quản trị Sinh viên (Nâng cấp)
│   ├── student-detail-drawer.tsx   # Drawer xem nhanh hồ sơ & bảng điểm SV
│   ├── student-import-dialog.tsx   # Modal import Excel/CSV sinh viên
│   ├── lecturers-view.tsx          # Trang Quản trị Giảng viên & Phân công (Tách riêng)
│   ├── lecturer-assignment-tab.tsx # Tab quản lý bảng phân công giảng dạy
│   └── lecturer-form-dialog.tsx    # Modal thêm / sửa giảng viên
├── services/
│   ├── student.service.ts          # API methods sinh viên + import/export
│   ├── lecturer.service.ts         # API methods giảng viên + phân công
│   └── types.ts                    # TypeScript interfaces đầy đủ
```

### 4.2. Hướng Dẫn Trải Nghiệm Người Dùng (UX/UI Best Practices)
* **Status Badges**:
  * `DANG_HOC`: Badge xanh lá (`bg-emerald-500/10 text-emerald-700 dark:text-emerald-400`).
  * `BAO_LUU`: Badge vàng cam (`bg-amber-500/10 text-amber-700 dark:text-amber-400`).
  * `TOT_NGHIEP`: Badge xanh dương (`bg-sky-500/10 text-sky-700 dark:text-sky-400`).
  * `BUOC_THOI_HOC`: Badge đỏ đậm (`bg-rose-500/10 text-rose-700 dark:text-rose-400`).
* **Import File UX**:
  * Hỗ trợ Drag & Drop file `.xlsx` hoặc `.csv`.
  * Có nút "Tải file mẫu (Template)" với định dạng chuẩn kèm chú thích các cột.
  * Preview trước 5 dòng đầu và đếm số lượng dòng hợp lệ / không hợp lệ trước khi bấm "Lưu vào hệ thống".

---

## ⚡ 5. CÁC PROMPT MẪU ĐỂ GEN CODE 1-CHẠM (PROMPT TEMPLATES)

### 📋 Prompt 1: Nâng Cấp Trang Quản Trị Sinh Viên (Students View & Import)
```text
Dựa theo tài liệu @file:ADMIN_GENERATION_SPEC.md mục 2 và 4:
Hãy nâng cấp trang Quản trị Sinh viên (FE/components/students-view.tsx) và bổ sung tính năng:
1. Thêm bộ lọc Trạng thái sinh viên (Tất cả, Đang học, Bảo lưu, Tốt nghiệp, Buộc thôi học) với Badges màu tương ứng.
2. Tạo Modal Import danh sách sinh viên từ file Excel/CSV: có nút tải file template mẫu, xem trước dữ liệu hợp lệ/lỗi trước khi import.
3. Bổ sung nút "Xem Bảng Điểm" trong menu thao tác từng dòng, mở Sheet/Drawer hiển thị điểm các môn và GPA tích lũy của sinh viên đó.
4. Đảm bảo validate form đầy đủ, tương thích với types.ts và api-client.ts hiện có, không có lỗi TypeScript hay build Next.js.
```

### 📋 Prompt 2: Tạo Trang Quản Trị Giảng Viên & Phân Công (Lecturers & Assignment)
```text
Dựa theo tài liệu @file:ADMIN_GENERATION_SPEC.md mục 3 và 4:
Hãy tạo mới trang Quản trị Giảng viên và Phân công giảng dạy chuyên biệt (FE/components/lecturers-view.tsx):
1. Tách riêng khỏi catalog view thông thường, tích hợp vào AdminWorkspace (/giang-vien).
2. Tab 1: Danh sách Giảng viên (Tìm kiếm theo Mã/Tên/Email, lọc theo Khoa, Thêm/Sửa/Xóa giảng viên, nút cấp/reset tài khoản).
3. Tab 2: Quản lý Phân công Giảng dạy (Hiển thị bảng PHANCONG, lọc theo Học kỳ & Giảng viên, Modal thêm mới phân công chọn Môn - Lớp - Kỳ, nút hủy phân công).
4. Viết bổ sung lecturer.service.ts trong FE/services và đăng ký routing trong app-navigation.ts.
5. Kiểm tra build npx tsc --noEmit và npm run build đảm bảo 0 lỗi.
```

### 📋 Prompt 3: Sinh API Import Excel / CSV ở Backend (Spring Boot 3)
```text
Dựa theo tài liệu @file:ADMIN_GENERATION_SPEC.md:
Hãy triển khai API Backend import sinh viên và giảng viên từ file Excel/CSV:
1. Tạo Controller & Service:
   - POST /api/v1/sinh-vien/import: Nhận file MultipartFile (xlsx/csv), đọc dữ liệu, validate từng dòng (kiểm tra tồn tại lớp, trùng mã SV/email), lưu batch và trả về số lượng thành công kèm danh sách lỗi chi tiết nếu có.
   - GET /api/v1/sinh-vien/template: Trả về file mẫu Excel/CSV có sẵn dữ liệu mẫu.
2. Thêm quyền @PreAuthorize("hasRole('ADMIN')").
3. Viết unit test kiểm thử logic đọc file và validate.
```
