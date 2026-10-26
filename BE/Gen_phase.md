# 📋 TÀI LIỆU YÊU CẦU & KẾ HOẠCH PHÁT TRIỂN HỆ THỐNG QUẢN LÝ SINH VIÊN (SPRING BOOT)

> **Mục tiêu**: Xây dựng Backend REST API và Giao diện Quản trị (Admin) chuẩn theo lược đồ CSDL 7 bảng: `KHOA`, `GIANGVIEN`, `LOP`, `SINHVIEN`, `MONHOC`, `HOCKY`, `KETQUA`.  
> **Nguyên tắc**: Chia nhỏ công việc thành các Phase độc lập; làm xong, test pass rồi mới chuyển phase tiếp theo.

---

## 🏗️ KIẾN TRÚC & QUY ƯỚC KỸ THUẬT

1. **Tech Stack**: Java 17/21, Spring Boot 3.x, Spring Data JPA, Spring Validation, H2/PostgreSQL/MySQL, Springdoc-OpenAPI (Swagger UI).
2. **Kiến trúc Layered**:
   * `entity`: Ánh xạ bảng CSDL, quan hệ `@ManyToOne`, `@OneToMany`.
   * `dto`: Request và Response riêng biệt, validation bằng `@NotBlank`, `@Min`, `@Max`, `@Email`...
   * `repository`: Kế thừa `JpaRepository`, dùng `@Query` hoặc method derivation.
   * `service`: Xử lý nghiệp vụ, tính toán điểm, check ràng buộc, `@Transactional`.
   * `controller`: Endpoint RESTful, trả về DTO qua `ResponseEntity`.
   * `exception`: Xử lý lỗi toàn cục bằng `@RestControllerAdvice`.
3. **Công thức tính điểm**:
   $$\text{Điểm Tổng} = (\text{DiemCC} \times 0.1) + (\text{DiemGK} \times 0.3) + (\text{DiemCK} \times 0.6)$$

---

## 📍 LỘ TRÌNH TRIỂN KHAI THEO PHASE (PROMPT-READY)

---

### 🔹 PHASE 0: Khởi Tạo Dự Án & Thiết Lập Cốt Lõi (Core & Infrastructure)
* **Mục tiêu**: Dựng khung Spring Boot, cấu hình kết nối DB, Global Exception Handler và Swagger UI.
* **Chi tiết công việc**:
  * Cấu hình `pom.xml` / `build.gradle` (Web, JPA, Validation, Lombok, OpenAPI).
  * Định nghĩa `ApiResponse<T>` chuẩn cho toàn hệ thống: `{ success, message, data, timestamp }`.
  * Tạo Custom Exceptions: `ResourceNotFoundException`, `BadRequestException`, `DuplicateResourceException`.
  * Tạo `@RestControllerAdvice` bắt lỗi: validation bean (`MethodArgumentNotValidException`), domain exceptions, SQL constraint violation.

> 📝 **Lệnh Copy cho Antigravity (Prompt Phase 0):**
> ```text
> Hãy thực hiện Phase 0 cho dự án Quản lý sinh viên Spring Boot 3:
> 1. Thiết lập cấu hình chuẩn (pom.xml/gradle, application.yml có H2 hoặc DB tương ứng, Swagger/OpenAPI).
> 2. Viết class ApiResponse<T> chuẩn bọc dữ liệu trả về.
> 3. Tạo các Custom Exception (ResourceNotFoundException, DuplicateResourceException).
> 4. Viết GlobalExceptionHandler (@RestControllerAdvice) chuẩn hóa toàn bộ lỗi (bao gồm lỗi validate @Valid và runtime exception).
> Lưu ý: Không viết entity hay service vội. Chỉ hoàn thành nền tảng này trước.
> ```

---

### 🔹 PHASE 1: Nhóm Danh Mục Độc Lập (KHOA, MONHOC, HOCKY)
* **Mục tiêu**: Hoàn thiện tầng Model, Repo, Service, Controller cho 3 bảng danh mục không có khóa ngoại trỏ đi đâu.
* **Các bảng triển khai**:
  * `KHOA`: `MaKhoa` (PK), `TenKhoa`.
  * `MONHOC`: `MaMH` (PK), `TenMH`, `SoTinChi` ($> 0$).
  * `HOCKY`: `MaHK` (PK), `NamHoc`, `Ky` (1, 2, hè).
* **Nghiệp vụ**:
  * CRUD đầy đủ cho 3 bảng.
  * Validate: Mã không được trùng, số tín chỉ $> 0$, không cho xóa nếu đang có liên kết.

> 📝 **Lệnh Copy cho Antigravity (Prompt Phase 1):**
> ```text
> Tiếp tục thực hiện Phase 1: Triển khai 3 danh mục độc lập: KHOA, MONHOC, HOCKY.
> 1. Viết Entity, DTO (Request/Response có Bean Validation), Repository, Service, Controller cho:
>    - Khoa (MaKhoa, TenKhoa)
>    - MonHoc (MaMH, TenMH, SoTinChi)
>    - HocKy (MaHK, NamHoc, Ky)
> 2. Đảm bảo có Swagger annotations (@Operation, @ApiResponse).
> 3. Tạo một file data.sql hoặc Seeder để nạp một vài bản ghi mẫu cho 3 bảng này.
> ```

---

### 🔹 PHASE 2: Nhóm Nhân Sự & Tổ Chức Lớp (GIANGVIEN & LOP)
* **Mục tiêu**: Xử lý mối quan hệ phụ thuộc giữa Khoa, Giảng viên và Lớp học.
* **Các bảng triển khai**:
  * `GIANGVIEN`: `MaGV` (PK), `HoTen`, `Email`, `SoDienThoai`, `MaKhoa` (FK ➔ `KHOA`).
  * `LOP`: `MaLop` (PK), `TenLop`, `KhoaHoc`, `MaKhoa` (FK ➔ `KHOA`), `MaGVCV` (FK ➔ `GIANGVIEN`, nullable).
* **Nghiệp vụ**:
  * Khi tạo/sửa Giảng viên: Phải kiểm tra `MaKhoa` có tồn tại không.
  * Khi tạo/sửa Lớp: Kiểm tra `MaKhoa` và `MaGVCV` (nếu có).
  * API lấy danh sách Giảng viên theo Khoa; lấy danh sách Lớp theo Khoa và kèm tên Cố vấn học tập (Ứng với Câu 2, Câu 3 trong báo cáo).

> 📝 **Lệnh Copy cho Antigravity (Prompt Phase 2):**
> ```text
> Tiếp tục Phase 2: Triển khai module GIANGVIEN và LOP.
> 1. Tạo Entity GIANGVIEN và LOP có mapping @ManyToOne với KHOA và GIANGVIEN (MaGVCV).
> 2. DTO Request/Response bọc thông tin (ví dụ: Response Lớp trả về kèm TenKhoa, TenGVCV).
> 3. Viết Service logic kiểm tra khóa ngoại tồn tại trước khi lưu.
> 4. Viết Endpoint:
>    - CRUD Giảng viên (lọc theo Khoa).
>    - CRUD Lớp học.
>    - Endpoint hiển thị danh sách Lớp kèm tên Khoa và tên Giảng viên cố vấn.
> ```

---

### 🔹 PHASE 3: Module Quản Lý Hồ Sơ Sinh Viên (SINHVIEN)
* **Mục tiêu**: Hoàn thiện toàn bộ chức năng quản lý sinh viên và xếp lớp.
* **Bảng triển khai**:
  * `SINHVIEN`: `MaSV` (PK), `HoTen`, `NgaySinh`, `GioiTinh`, `DiaChi`, `Email`, `SoDienThoai`, `MaLop` (FK ➔ `LOP`).
* **Nghiệp vụ**:
  * Validate Email format, định dạng số điện thoại, ngày sinh hợp lệ.
  * API lấy danh sách sinh viên có phân trang (`Pageable`), tìm kiếm theo Tên, lọc theo Lớp (`MaLop`) và theo Khoa (Ứng với Câu 1, Câu 13).
  * API cập nhật thông tin cá nhân (SĐT, Địa chỉ) mà không làm đổi mã SV hay Lớp (Ứng với Câu 11).

> 📝 **Lệnh Copy cho Antigravity (Prompt Phase 3):**
> ```text
> Tiếp tục Phase 3: Triển khai module SINHVIEN.
> 1. Tạo Entity SINHVIEN liên kết @ManyToOne với LOP.
> 2. DTO SinhVienRequestDTO (validate định dạng phone, email, @NotBlank) và SinhVienResponseDTO.
> 3. Tầng Service:
>    - Kiểm tra MaSV trùng.
>    - Kiểm tra MaLop tồn tại.
> 4. Controller:
>    - CRUD Sinh viên.
>    - API xem danh sách sinh viên có phân trang và lọc theo MaLop.
>    - API cập nhật riêng SĐT/địa chỉ sinh viên.
> ```

---

### 🔹 PHASE 4: Quản Lý Điểm Số & Kết Quả Học Tập (KETQUA)
* **Mục tiêu**: Xử lý bảng kết hợp có khóa chính phức hợp và công thức tính điểm.
* **Bảng triển khai**:
  * `KETQUA`: Khóa chính ghép `@EmbeddedId` (`MaSV`, `MaMH`, `MaHK`), `DiemCC`, `DiemGK`, `DiemCK`.
* **Nghiệp vụ**:
  * Ràng buộc miền giá trị: Điểm từ $0.0$ đến $10.0$.
  * Tự động tính điểm tổng kết theo công thức: $\text{DiemTong} = 0.1 \times CC + 0.3 \times GK + 0.6 \times CK$.
  * API nhập/sửa điểm cho một sinh viên theo môn và kỳ (Ứng với Câu 12, 14).
  * API tra cứu toàn bộ bảng điểm của một sinh viên (Ứng với Câu 4, 5).

> 📝 **Lệnh Copy cho Antigravity (Prompt Phase 4):**
> ```text
> Tiếp tục Phase 4: Triển khai module Điểm số (KETQUA).
> 1. Tạo Entity KetQua với khóa chính ghép @Embeddable KetQuaId (maSV, maMH, maHK).
> 2. Validate điểm số trong khoảng [0, 10].
> 3. Logic tự động tính Điểm tổng kết: DiemTong = DiemCC*0.1 + DiemGK*0.3 + DiemCK*0.6 trong DTO Response.
> 4. Controller:
>    - API nhập/cập nhật điểm (từng thành phần hoặc cả bộ).
>    - API tra cứu bảng điểm chi tiết theo MaSV.
>    - API xóa một bản ghi điểm theo bộ 3 khóa (MaSV, MaMH, MaHK).
> ```

---

### 🔹 PHASE 5: Báo Cáo, Thống Kê & Truy Vấn Nghiệp Vụ (Reports & Analytics)
* **Mục tiêu**: Triển khai các câu truy vấn phức tạp phục vụ Admin/Cán bộ đào tạo (các câu hỏi SQL còn lại trong báo cáo).
* **Nghiệp vụ cần làm**:
  1. Thống kê số lượng sinh viên trong từng lớp (Câu 6).
  2. Tính điểm cuối kỳ trung bình của từng môn học (Câu 7).
  3. Tìm sinh viên có điểm cuối kỳ $\ge 8.0$ ở một môn cụ thể (Câu 8).
  4. Liệt kê sinh viên chưa có bản ghi kết quả nào (Câu 9).
  5. Thống kê số lượng bản ghi kết quả theo từng học kỳ (Câu 10).
  6. Tìm môn học chưa có sinh viên nào có kết quả (Câu 15).

> 📝 **Lệnh Copy cho Antigravity (Prompt Phase 5):**
> ```text
> Tiếp tục Phase 5: Xây dựng Module Báo cáo Thống kê (Dashboard & Report Controller).
> Viết các custom query (JPQL hoặc Native Query) và DTO tổng hợp để phục vụ:
> 1. Thống kê sĩ số sinh viên theo từng lớp.
> 2. Tính điểm cuối kỳ trung bình theo từng môn học.
> 3. Lọc danh sách sinh viên có điểm CK >= 8.0 theo môn.
> 4. Tìm sinh viên chưa có điểm nào (nợ bảng điểm) và môn học chưa có ai học.
> 5. Thống kê số lượt nhập điểm theo học kỳ.
> ```

---

### 🔹 PHASE 6: Giao Diện Quản Trị Admin (Front-end Admin UI)
* **Mục tiêu**: Xây dựng màn hình Admin tiêu chuẩn (dùng Thymeleaf + Bootstrap/Tailwind hoặc React single-file).
* **Bố cục giao diện**:
  * **Sidebar**: Dashboard, Quản lý Khoa/Lớp, Quản lý Môn/Kỳ, Hồ sơ Sinh viên, Nhập điểm & Bảng điểm, Báo cáo thống kê.
  * **Màn CRUD chuẩn**: Bảng dữ liệu có phân trang, thanh tìm kiếm, modal thêm/sửa, thông báo toast success/error.
  * **Màn Bảng điểm**: Chọn Sinh viên ➔ Render bảng điểm từng môn kèm điểm CC, GK, CK, Điểm tổng kết và Đánh giá (Đạt/Trượt).

> 📝 **Lệnh Copy cho Antigravity (Prompt Phase 6):**
> ```text
> Tiếp tục Phase 6: Xây dựng Giao diện Admin kết nối với các REST API đã hoàn thành.
> Dựng giao diện quản trị Admin với:
> 1. Menu điều hướng khoa học (Khoa/Lớp -> Sinh viên -> Điểm số -> Thống kê).
> 2. Bảng quản lý sinh viên: Tìm kiếm, phân trang, thêm mới, sửa nhanh.
> 3. Màn hình quản lý điểm: Chọn sinh viên để hiển thị bảng điểm chi tiết (có tự động tính điểm tổng kết và hiển thị cảnh báo trượt môn nếu tổng < 4.0).
> 4. Màn hình dashboard hiển thị các số liệu thống kê từ Phase 5.
> ```

---

## 📌 HƯỚNG DẪN DÙNG TÀI LIỆU NÀY
1. Giao việc cho Antigravity **chỉ 1 Phase tại một thời điểm**.
2. Sau mỗi Phase, yêu cầu bot kiểm tra lại build (`mvn clean compile` hoặc `./gradlew build`) và test thử endpoint trên Swagger UI (`/swagger-ui/index.html`).
3. Xác nhận phase hiện tại hoạt động trơn tru thì mới copy Prompt của phase kế tiếp.