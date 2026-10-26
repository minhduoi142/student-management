# 🎓 Hệ Thống Quản Lý Sinh Viên (Student Management System)

> Dự án Backend RESTful API & Giao diện Quản trị dành cho Hệ thống Quản lý Sinh viên — Nhóm 6 CE02 (Môn Cơ sở dữ liệu).

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203-green.svg)](http://localhost:8081/swagger-ui/index.html)

---

## 📌 Mục Lục
- [1. Yêu Cầu Môi Trường (Prerequisites)](#1-yêu-cầu-môi-trường-prerequisites)
- [2. Clone Dự Án (Git Clone)](#2-clone-dự-án-git-clone)
- [3. Cấu Hình & Chạy Backend (Spring Boot)](#3-cấu-hình--chạy-backend-spring-boot)
- [4. Cấu Hình & Chạy Frontend (Admin UI)](#4-cấu-hình--chạy-frontend-admin-ui)
- [5. Tài Liệu API & Swagger UI](#5-tài-liệu-api--swagger-ui)
- [6. Cấu Trúc Dự Án (Project Structure)](#6-cấu-trúc-dự-án-project-structure)
- [7. Kiểm Thử Hệ Thống (Testing)](#7-kiểm-thử-hệ-thống-testing)

---

## 1. Yêu Cầu Môi Trường (Prerequisites)

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:

| Công cụ | Phiên bản khuyến nghị | Ghi chú |
| :--- | :--- | :--- |
| **Java JDK** | 21 trở lên (Eclipse Temurin / Oracle OpenJDK) | Kiểm tra bằng: `java -version` |
| **Apache Maven** | 3.9+ | Kiểm tra bằng: `mvn -v` |
| **MySQL Server** | 8.0+ | Chạy trên cổng mặc định `3306` |
| **Node.js & npm** | Node.js 18+ / 20+ | Dành cho Frontend, kiểm tra: `node -v` |
| **Git** | Bản mới nhất | Kiểm tra bằng: `git --version` |

---

## 2. Clone Dự Án (Git Clone)

Mở terminal (PowerShell, Command Prompt hoặc Git Bash) và thực hiện lệnh clone:

```bash
# Clone dự án về máy
git clone https://github.com/minhduoi142/student-management.git

# Di chuyển vào thư mục dự án
cd student-management
```

---

## 3. Cấu Hình & Chạy Backend (Spring Boot)

### Bước 3.1: Chuẩn bị Cơ sở dữ liệu MySQL
1. Khởi động MySQL Server (qua MySQL Workbench hoặc XAMPP / Docker).
2. Tạo database `qlsv` (nếu chưa có):
   ```sql
   CREATE DATABASE qlsv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
   *(Lưu ý: Hệ thống đã bật chế độ tự động sinh bảng `ddl-auto=update`, bạn có thể chạy file [qlsv_schema.sql](qlsv_schema.sql) trong MySQL Workbench nếu muốn nạp trước cấu trúc constraint gốc).*

### Bước 3.2: Thiết lập biến môi trường (.env)
Dự án sử dụng file `.env` để bảo mật thông tin kết nối và cấu hình linh hoạt.

1. Tại thư mục gốc của Backend, sao chép file `.env.example` thành `.env`:
   * **Windows (PowerShell):**
     ```powershell
     Copy-Item .env.example .env
     ```
   * **Linux / MacOS / Git Bash:**
     ```bash
     cp .env.example .env
     ```
2. Mở file `.env` và cập nhật thông số MySQL của bạn (đặc biệt là mật khẩu `DB_PASSWORD`):
   ```env
   # Server Configuration
   SERVER_PORT=8081

   # Database Configuration
   DB_URL=jdbc:mysql://localhost:3306/qlsv?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Ho_Chi_Minh
   DB_USERNAME=root
   DB_PASSWORD=Mật_khẩu_MySQL_của_bạn
   DB_DRIVER=com.mysql.cj.jdbc.Driver

   # JPA / Hibernate Configuration
   JPA_SHOW_SQL=true
   JPA_FORMAT_SQL=true
   JPA_DDL_AUTO=update
   JPA_NAMING_STRATEGY=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
   ```

### Bước 3.3: Khởi chạy Backend
Bạn có thể chọn 1 trong 2 cách sau:

* **Cách 1: Chạy bằng dòng lệnh Maven:**
  ```bash
  mvn clean compile
  mvn spring-boot:run
  ```

* **Cách 2: Chạy trực tiếp bằng IDE (IntelliJ IDEA / VS Code / Eclipse):**
  1. Mở thư mục dự án trong IDE.
  2. Đợi IDE tải xong các dependency từ `pom.xml`.
  3. Mở file [Main.java](src/main/java/com/ocr/Main.java) (`src/main/java/com/ocr/Main.java`).
  4. Nhấn biểu tượng **▶ Run**.

> 💡 **Khởi tạo dữ liệu mẫu tự động**: Khi ứng dụng khởi động thành công, hệ thống tự động kiểm tra và nạp sẵn dữ liệu mẫu cho Khoa, Giảng viên, Lớp học, Sinh viên, Môn học và Kết quả điểm ban đầu.

---

## 4. Cấu Hình & Chạy Frontend (Admin UI)

Nếu ứng dụng có thư mục Frontend (`frontend` hoặc `client`):

### Bước 4.1: Di chuyển vào thư mục Frontend
```bash
cd frontend
```

### Bước 4.2: Cấu hình biến môi trường Frontend
Tạo file `.env` hoặc `.env.local` trong thư mục `frontend`:
```env
# Địa chỉ URL của Backend Spring Boot
VITE_API_BASE_URL=http://localhost:8081/api/v1
```

### Bước 4.3: Cài đặt thư viện & Chạy Development Server
```bash
# Cài đặt các gói phụ thuộc
npm install

# Khởi chạy giao diện phát triển
npm run dev
```

* Mở trình duyệt và truy cập: **`http://localhost:5173`** (hoặc cổng mà terminal hiển thị).

---

## 5. Tài Liệu API & Swagger UI

Backend đã được tích hợp sẵn tài liệu tương tác **Springdoc OpenAPI v3**:

* **Giao diện Swagger UI trực quan:**
  👉 [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
* **OpenAPI JSON Spec:**
  👉 [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

### Danh sách nhóm API chính:
1. **Quản lý Khoa** (`/api/v1/khoa`): CRUD Khoa đào tạo.
2. **Quản lý Giảng viên** (`/api/v1/giang-vien`): CRUD Giảng viên, lọc theo Khoa.
3. **Quản lý Lớp học** (`/api/v1/lop`): CRUD Lớp học, hiển thị tên Khoa và Giảng viên cố vấn.
4. **Quản lý Hồ sơ Sinh viên** (`/api/v1/sinh-vien`):
   * Tìm kiếm, lọc theo Lớp (Câu 1), lọc theo Khoa (Câu 13) có phân trang `Pageable`.
   * Cập nhật thông tin cá nhân (SĐT, địa chỉ - Câu 11).
5. **Quản lý Môn học** (`/api/v1/mon-hoc`): CRUD Môn học và Số tín chỉ.
6. **Quản lý Học kỳ** (`/api/v1/hoc-ky`): CRUD Học kỳ và Năm học.
7. **Quản lý Điểm & Kết quả** (`/api/v1/diem`):
   * Nhập / sửa điểm theo môn và học kỳ (Câu 12, 14).
   * Tra cứu bảng điểm chi tiết, tính điểm tổng kết ($0.1 \times CC + 0.3 \times GK + 0.6 \times CK$), tổng tín chỉ tích lũy & GPA (Câu 4, 5).
8. **Báo cáo Thống kê & Dashboard** (`/api/v1/thong-ke`):
   * Sĩ số sinh viên từng lớp (Câu 6).
   * Điểm cuối kỳ trung bình theo môn học (Câu 7).
   * Lọc sinh viên điểm cuối kỳ $\ge 8.0$ (Câu 8).
   * Sinh viên chưa có điểm (Câu 9).
   * Lượt nhập điểm theo học kỳ (Câu 10).
   * Môn học chưa ai học (Câu 15).
   * Dashboard KPIs tổng quan toàn trường.

---

## 6. Cấu Trúc Dự Án (Project Structure)

```text
QLSV/
├── .env.example                          # File mẫu cấu hình biến môi trường
├── .env                                  # File cấu hình thực tế (được gitignore bảo vệ)
├── .gitignore                            # Cấu hình bỏ qua các file nhạy cảm và build artifact
├── pom.xml                               # Quản lý thư viện Maven (Java 21, Spring Boot, JPA, OpenAPI)
├── qlsv_schema.sql                       # Lược đồ CSDL 7 bảng chuẩn MySQL
├── README.md                             # Hướng dẫn chi tiết sử dụng dự án
└── src/
    ├── main/
    │   ├── java/com/ocr/
    │   │   ├── Main.java                 # Entry-point ứng dụng (tự động nạp .env)
    │   │   ├── config/                   # Cấu hình OpenAPI, Seeder dữ liệu mẫu, Dotenv
    │   │   ├── controller/               # REST Controllers chuẩn HTTP Status & DTO
    │   │   ├── dto/                      # Request & Response Records (Bean Validation & Swagger)
    │   │   ├── entity/                   # JPA Entities (Khoa, GiangVien, Lop, SinhVien, MonHoc, HocKy, KetQua)
    │   │   │   ├── converter/            # JPA Attribute Converter (GioiTinhConverter)
    │   │   │   ├── enums/                # Enum định nghĩa Giới tính ('Nam', 'Nữ')
    │   │   │   └── id/                   # Composite Key KetQuaId (@Embeddable)
    │   │   ├── exception/                # GlobalExceptionHandler & Custom Domain Exceptions
    │   │   ├── repository/               # Spring Data JPA Repositories & JPQL Queries
    │   │   └── service/                  # Business Logic Interfaces & Implementations (@Transactional)
    │   └── resources/
    │       ├── application.properties    # Cấu hình ứng dụng ánh xạ biến môi trường
    │       └── data.sql                  # Script nạp dữ liệu mẫu
    └── test/
        └── java/com/ocr/service/         # Unit Tests kiểm thử nghiệp vụ (JUnit 5 + Mockito)
```

---

## 7. Kiểm Thử Hệ Thống (Testing)

Dự án được bảo vệ bởi bộ Unit Test tự động viết bằng **JUnit 5** và **Mockito** bao phủ toàn bộ các tầng Service:

Chạy kiểm thử toàn bộ dự án bằng lệnh:
```bash
mvn clean test
```

Kết quả mong đợi:
```text
[INFO] Tests run: 28, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 👥 Nhóm Tác Giả & Hỗ Trợ
* **Đơn vị**: Nhóm 6 CE02 — Môn Cơ sở dữ liệu.
* **Hỗ trợ kỹ thuật**: Vui lòng tạo issue trên kho lưu trữ hoặc liên hệ qua email quản trị hệ thống.
