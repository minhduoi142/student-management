# 🎓 Hệ Thống Quản Lý Sinh Viên (Student Management System)

> Dự án Backend RESTful API & Giao diện Quản trị dành cho Hệ thống Quản lý Sinh viên — Nhóm 6 CE02 (Môn Cơ sở dữ liệu).

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4+-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-blue.svg)](https://www.mysql.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203-green.svg)](http://localhost:8081/swagger-ui/index.html)
[![JWT](https://img.shields.io/badge/Security-Spring%20Security%206%20%2B%20JWT-red.svg)](https://spring.io/projects/spring-security)

---

## 📌 Mục Lục
- [1. Yêu Cầu Môi Trường (Prerequisites)](#1-yêu-cầu-môi-trường-prerequisites)
- [2. Clone Dự Án (Git Clone)](#2-clone-dự-án-git-clone)
- [3. Cấu Hình & Chạy Backend (Spring Boot)](#3-cấu-hình--chạy-backend-spring-boot)
- [4. Cấu Hình & Chạy Frontend (Admin UI)](#4-cấu-hình--chạy-frontend-admin-ui)
- [5. Tài Liệu API & Swagger UI](#5-tài-liệu-api--swagger-ui)
- [6. Cấu Trúc Dự Án (Project Structure)](#6-cấu-trúc-dự-án-project-structure)
- [7. Kiểm Thử Hệ Thống (Testing)](#7-kiểm-thử-hệ-thống-testing)
- [8. Đặc Tả Sinh Trang Quản Trị (Admin Generation Spec)](#8-đặc-tả-sinh-trang-quản-trị-admin-generation-spec)

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
1. Khởi động MySQL Server (qua MySQL Workbench, XAMPP hoặc Docker).
2. Tạo database `qlsv` (nếu chưa có) hoặc chạy toàn bộ file script [qlsv_schema.sql](qlsv_schema.sql) để tạo 9 bảng chuẩn kèm dữ liệu mẫu ban đầu:
   ```sql
   -- File qlsv_schema.sql tự động tạo DB qlsv và 9 bảng:
   -- KHOA, GIANGVIEN, LOP, SINHVIEN, MONHOC, HOCKY, KETQUA, TAIKHOAN, PHANCONG
   ```
   *(Lưu ý: Hệ thống đã bật chế độ tự động sinh bảng `ddl-auto=update` và tự nạp tài khoản admin nếu DB trống).*

### Bước 3.2: Thiết lập biến môi trường (.env)
Dự án sử dụng file `.env` để bảo mật thông tin kết nối và cấu hình linh hoạt.

1. Tại thư mục `BE/` (hoặc thư mục gốc), sao chép file `.env.example` thành `.env`:
   * **Windows (PowerShell):**
     ```powershell
     Copy-Item .env.example .env
     ```
   * **Linux / MacOS / Git Bash:**
     ```bash
     cp .env.example .env
     ```
2. Mở file `.env` và cập nhật thông số kết nối MySQL của bạn:
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

   # JWT Security Configuration
   JWT_SECRET=9a4f2c8d3e71b5a6c4d8e2f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1
   JWT_EXPIRATION_MS=86400000
   ```

### Bước 3.3: Khởi chạy Backend
```bash
cd BE
mvn clean compile
mvn spring-boot:run
```
Khi hiển thị log:
```text
Started Main in X.XXX seconds (process running for X.XXX)
```
Backend đã sẵn sàng phục vụ tại: **http://localhost:8081**

### Tài khoản đăng nhập mẫu:
* **Quản trị viên (ADMIN)**: `admin` / `admin123`
* **Giảng viên (GIANGVIEN)**: `gv01` / `123456` (Mã GV: `GV01`)
* **Sinh viên (SINHVIEN)**: `b24dcce001` / `123456` (Mã SV: `B24DCCE001`)

---

## 4. Cấu Hình & Chạy Frontend (Admin UI)

Giao diện quản trị được xây dựng trên nền tảng **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, và **Shadcn UI**.

### Bước 4.1: Cài đặt Dependencies
Mở cửa sổ terminal mới và di chuyển vào thư mục `FE`:
```bash
cd FE
npm install
```

### Bước 4.2: Chạy Dev Server
```bash
npm run dev
```
Truy cập trình duyệt tại: **http://localhost:3000**

---

## 5. Tài Liệu API & Swagger UI

Dự án tích hợp đầy đủ tài liệu API trực quan qua **Springdoc OpenAPI 3.0**:

* **Giao diện Swagger UI tương tác**: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
* **OpenAPI Specification (JSON)**: [http://localhost:8081/v3/api-docs](http://localhost:8081/v3/api-docs)

> **Hướng dẫn xác thực Swagger UI**:
> 1. Gọi API `POST /api/v1/auth/login` với tài khoản `admin / admin123` để nhận `accessToken`.
> 2. Bấm nút **Authorize** ở góc trên bên phải Swagger UI và dán token.

---

## 6. Cấu Trúc Dự Án (Project Structure)

```text
student-management/
├── BE/                                   # Backend Source Code (Spring Boot 3 + Java 21)
│   ├── src/main/java/com/ocr/
│   │   ├── config/                       # SecurityConfig, OpenApiConfig, DataInitializer
│   │   ├── controller/                   # AuthController, SinhVienController, KetQuaController...
│   │   ├── dto/                          # Request & Response Records
│   │   ├── entity/                       # JPA Entities (Khoa, GiangVien, Lop, SinhVien, MonHoc, HocKy, KetQua, TaiKhoan, PhanCong)
│   │   ├── exception/                    # GlobalExceptionHandler
│   │   ├── repository/                   # Spring Data JPA Repositories
│   │   ├── security/                     # SecurityService, CustomUserDetailsService, JWT Utils
│   │   └── service/                      # Business Logic Services
│   ├── src/main/resources/
│   │   ├── application.properties        # Ánh xạ cấu hình biến môi trường
│   │   └── data.sql                      # Dữ liệu khởi tạo mặc định
│   └── pom.xml                           # Maven dependencies
├── FE/                                   # Frontend Source Code (Next.js 16 + Tailwind CSS)
│   ├── app/                              # Next.js App Router
│   ├── components/                       # StudentsView, GradesView, CatalogView, AdminWorkspace
│   ├── lib/                              # Axios API client có interceptor Bearer Token
│   └── services/                         # API service modules (student, grade, catalog, auth)
├── qlsv_schema.sql                       # Lược đồ CSDL 9 bảng chuẩn MySQL 8.0+
├── ADMIN_GENERATION_SPEC.md              # Đặc tả toàn diện sinh trang quản trị Sinh viên & Giảng viên
└── README.md                             # Hướng dẫn chi tiết sử dụng dự án
```

---

## 7. Kiểm Thử Hệ Thống (Testing)

Dự án được bảo vệ bởi bộ Unit Test tự động viết bằng **JUnit 5** và **Mockito** bao phủ toàn bộ các tầng Service và Security:

```bash
cd BE
mvn test
```

Kết quả:
```text
[INFO] Results:
[INFO] Tests run: 41, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

---

## 8. Đặc Tả Sinh Trang Quản Trị (Admin Generation Spec)

Để mở rộng hoặc yêu cầu AI Agent sinh mới/nâng cấp giao diện quản trị chuyên biệt:
* Xem chi tiết tại tài liệu: [ADMIN_GENERATION_SPEC.md](ADMIN_GENERATION_SPEC.md)
* Bao gồm:
  - Bản vẽ kỹ thuật & hợp đồng API cho trang Quản trị Sinh viên (Lọc trạng thái, Import Excel/CSV, Quản lý tài khoản, Xem bảng điểm nhanh).
  - Bản vẽ kỹ thuật & hợp đồng API cho trang Quản trị Giảng viên & Phân công giảng dạy (`PHANCONG`).
  - Các câu lệnh prompt mẫu 1-chạm (Prompt-ready) để sinh code tự động.

---

## 👥 Nhóm Tác Giả & Hỗ Trợ
* **Đơn vị**: Nhóm 6 CE02 — Môn Cơ sở dữ liệu.
* **Hỗ trợ kỹ thuật**: Vui lòng tạo issue trên kho lưu trữ hoặc liên hệ qua email quản trị hệ thống.
