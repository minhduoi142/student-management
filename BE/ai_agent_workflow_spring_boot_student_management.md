# 🤖 AI Agent Workflow: Spring Boot Feature Development (Student Management System)

Tài liệu này định nghĩa quy trình chuẩn (SOP), các tiêu chuẩn kỹ thuật và nguyên tắc bắt buộc mà AI Agent phải tuân thủ nghiêm ngặt khi xây dựng hoặc cập nhật bất kỳ tính năng nào trong dự án **Spring Boot - Quản lý Sinh viên (Student Management System)**.

---

## 🧭 Nguyên Tắc Cốt Lõi (Guiding Principles)

1. **Standard Layered Architecture**: Tuân thủ nghiêm ngặt mô hình phân tầng chuẩn của Spring Boot:
   `Controller` ➔ `Service (Interface & Impl)` ➔ `Repository (Spring Data JPA)` ➔ `Database`.
2. **DTO Pattern & Encapsulation**: Tuyệt đối không phơi bày `@Entity` trực tiếp qua API response hoặc nhận `@Entity` ở request body. Luôn dùng Request DTO và Response DTO.
3. **Fail-Fast & Explicit Validation**: Sử dụng Jakarta Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Size`, `@Email`, `@Pattern`) ngay tại Controller Layer.
4. **Centralized Exception Handling**: Sử dụng `@RestControllerAdvice` để xử lý tập trung mọi business và system exception, trả về format lỗi chuẩn (`ProblemDetail` theo RFC 7807 hoặc custom `ErrorResponse`).
5. **Living Documentation**: Bất kỳ API nào được tạo hoặc sửa đổi đều phải gắn đầy đủ annotations của **Springdoc OpenAPI / Swagger v3** (`@Operation`, `@ApiResponse`, `@Schema`).
6. **Immutable & Clean Code**: Khuyến khích sử dụng Java Record cho DTOs (nếu dùng Java 17+), Lombok có chừng mực (tránh dùng `@Data` trên JPA Entity; chỉ dùng `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`), Constructor Injection qua `@RequiredArgsConstructor`.

---

## 🏗️ Cấu Trúc Gói Chuẩn (Target Package Structure)

```text
com.university.studentmanagement/
├── config/             # OpenAPI, Security, ModelMapper/MapStruct config
├── controller/         # REST Controllers (@RestController)
├── dto/
│   ├── request/        # StudentCreationRequest, StudentUpdateRequest, FilterRequest
│   └── response/       # StudentResponse, PageResponse, ApiResponseWrapper
├── entity/             # JPA Entities (@Entity, @Table): Student, Course, Enrollment, Department
├── enums/              # StudentStatus, Gender, Semester, GradeLevel
├── exception/          # Custom Exceptions & GlobalExceptionHandler (@RestControllerAdvice)
├── mapper/             # MapStruct interfaces hoặc Manual Mappers
├── repository/         # Spring Data JPA Repositories (@Repository)
├── service/            # Business Service Interfaces
│   └── impl/           # Business Service Implementations (@Service, @Transactional)
└── specification/      # JPA Specifications cho dynamic search/filter
```

---

## 🔄 Quy Trình 5 Bước (Step-by-Step Execution Workflow)

```text
[Phase 1: Explore & Analyze] ➔ [Phase 2: Entity & DTO Contract] ➔ [Phase 3: Implementation & OpenAPI] ➔ [Phase 4: Tests & Verify] ➔ [Phase 5: Self-Review & Report]
```

### Phase 1: Explore & Analyze (Khảo Sát & Phân Tích)
* **Mục tiêu**: Hiểu rõ yêu cầu nghiệp vụ quản lý sinh viên và các ràng buộc dữ liệu.
* **Hành động**:
  1. Đọc kỹ mô tả task (ví dụ: "Đăng ký môn học", "Tìm kiếm sinh viên phân trang theo khoa và GPA", "Cập nhật trạng thái thôi học/bảo lưu").
  2. Xác định các Entity liên quan: `Student`, `Classroom`, `Department`, `Course`, `Enrollment`, `Score`.
  3. Kiểm tra DB migration tool đang dùng (Flyway / Liquibase) hoặc cấu hình `spring.jpa.hibernate.ddl-auto`.
  4. Xác định các logic nghiệp vụ đặc thù:
     * Mã số sinh viên (Student Code / MSSV) có quy tắc sinh tự động không? (ví dụ: `SV2026xxxx`).
     * Ràng buộc tín chỉ tối đa/tối thiểu trong một học kỳ.
     * Điểm số trong thang điểm 4 hoặc 10.
* **Đầu ra**: Kế hoạch thực hiện ngắn gọn (file cần tạo, file cần sửa, migration script nếu có).

---

### Phase 2: Entity & DTO Contract (Thiết Kế Lớp Dữ Liệu & Hợp Đồng)
* **Mục tiêu**: Định nghĩa rõ ràng cấu trúc bảng, ràng buộc toàn vẹn và payload API.
* **Hành động**:
  1. **JPA Entity Rules**:
     * Khóa chính dùng `GenerationType.IDENTITY` hoặc `UUID`.
     * Audit fields: Kế thừa từ `BaseAuditableEntity` (`createdAt`, `updatedAt`, `createdBy`, `updatedAt`).
     * Tránh vòng lặp vô hạn `StackOverflowError` trong quan hệ `@OneToMany` / `@ManyToMany` (luôn dùng `fetch = FetchType.LAZY`, không include quan hệ hai chiều trong `toString()` hoặc `equals/hashCode`).
  2. **DTO & Validation**:
     ```java
     public record CreateStudentRequest(
         @NotBlank(message = "Mã số sinh viên không được để trống")
         @Pattern(regexp = "^SV\\d{8}$", message = "Mã sinh viên phải có dạng SVxxxxxxxx")
         @Schema(example = "SV20260001", description = "Mã số sinh viên duy nhất")
         String studentCode,

         @NotBlank(message = "Họ và tên không được để trống")
         @Size(min = 2, max = 100, message = "Tên sinh viên từ 2 đến 100 ký tự")
         @Schema(example = "Nguyễn Văn A")
         String fullName,

         @NotNull(message = "Ngày sinh không được để trống")
         @Past(message = "Ngày sinh phải là ngày trong quá khứ")
         @Schema(example = "2004-05-15")
         LocalDate dateOfBirth,

         @NotBlank(message = "Email không được để trống")
         @Email(message = "Email sinh viên không hợp lệ")
         @Schema(example = "vana.nguyen@university.edu.vn")
         String email,

         @NotNull(message = "Khoa/Viện không được để trống")
         @Schema(example = "1")
         Long departmentId
     ) {}
     ```
  3. **Custom Exceptions**:
     * Tạo exception rõ nghĩa kế thừa `RuntimeException` (ví dụ: `StudentNotFoundException`, `StudentCodeAlreadyExistsException`, `CreditLimitExceededException`).

---

### Phase 3: Implementation & OpenAPI Documentation (Triển Khai Logic)
* **Mục tiêu**: Viết mã nguồn nghiệp vụ sạch, quản lý transaction an toàn và ghi chú Swagger đầy đủ.
* **Hành động**:
  1. **Repository Layer**:
     * Kế thừa `JpaRepository<Student, Long>` và `JpaSpecificationExecutor<Student>` nếu cần dynamic filter.
     * Tận dụng Spring Data Derived Queries hoặc `@Query` JPQL/Native khi cần tối ưu hiệu năng.
  2. **Service Layer**:
     * Luôn tạo Service Interface (e.g., `StudentService`) và lớp triển khai (`StudentServiceImpl`).
     * Quản lý transaction rõ ràng:
       * Class-level: `@Transactional(readOnly = true)`
       * Method ghi/xóa/sửa: `@Transactional`
     * Không catch generic `Exception` rồi nuốt lỗi; ném domain exception cụ thể để ControllerAdvice xử lý.
  3. **Controller Layer & OpenAPI 3 (Springdoc)**:
     * Dùng Constructor Injection:
       ```java
       @RestController
       @RequestMapping("/api/v1/students")
       @RequiredArgsConstructor
       @Tag(name = "Student Management", description = "APIs quản lý hồ sơ và thông tin học tập của sinh viên")
       public class StudentController {

           private final StudentService studentService;

           @PostMapping
           @ResponseStatus(HttpStatus.CREATED)
           @Operation(summary = "Tạo mới sinh viên", description = "Tiếp nhận hồ sơ sinh viên mới và cấp mã sinh viên")
           @ApiResponses(value = {
               @ApiResponse(responseCode = "201", description = "Tạo sinh viên thành công",
                   content = @Content(schema = @Schema(implementation = StudentResponse.class))),
               @ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ",
                   content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
               @ApiResponse(responseCode = "409", description = "Trùng lặp mã sinh viên hoặc email",
                   content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
           })
           public StudentResponse createStudent(@Valid @RequestBody CreateStudentRequest request) {
               return studentService.createStudent(request);
           }

           @GetMapping
           @Operation(summary = "Lấy danh sách sinh viên có phân trang và bộ lọc")
           public PageResponse<StudentResponse> getStudents(
                   @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
                   @RequestParam(required = false) String keyword,
                   @RequestParam(required = false) Long departmentId) {
               return studentService.getStudents(keyword, departmentId, pageable);
           }
       }
       ```

---

### Phase 4: Testing & Verification (Kiểm Thử & Đảm Bảo Chất Lượng)
* **Mục tiêu**: Đảm bảo tất cả flow thành công và edge cases đều được bảo vệ bởi test suite.
* **Hành động**:
  1. **Unit Test (Service Layer)**:
     * Sử dụng **JUnit 5** và **Mockito** (`@ExtendWith(MockitoExtension.class)`).
     * Mock `StudentRepository`, `DepartmentRepository`, mapper.
     * Kiểm tra trường hợp ném exception (e.g., `assertThrows(StudentNotFoundException.class, ...)`).
  2. **Slice Test (Controller Layer)**:
     * Dùng `@WebMvcTest(StudentController.class)` kết hợp `MockMvc`.
     * Kiểm tra Validation triggers (gửi payload thiếu trường bắt buộc, mong đợi status 400).
  3. **Chạy Lệnh Build & Test**:
     ```bash
     # Nếu dùng Maven Wrapper
     ./mvnw clean test

     # Hoặc nếu dùng Gradle Wrapper
     ./gradlew clean test
     ```
  4. Đảm bảo toàn bộ test pass 100%, không có compilation warning bị bỏ qua.

---

### Phase 5: Self-Review & Report (Rà Soát & Báo Cáo)
* **Mục tiêu**: Tổng hợp kết quả công việc rõ ràng cho người phụ trách.
* **Hành động**:
  * Soạn báo cáo hoàn thành bao gồm:
    1. **Tóm tắt thay đổi**: Danh sách các file mới tạo hoặc sửa đổi theo từng package (`entity`, `dto`, `service`, `controller`).
    2. **API Endpoints**: Danh sách endpoint (Method, Path, Request/Response mẫu).
    3. **Swagger URL**: Đường dẫn tới Swagger UI local (e.g., `http://localhost:8080/swagger-ui/index.html`).
    4. **Mẫu cURL**: Ít nhất một lệnh `curl` hoàn chỉnh để test nhanh endpoint vừa làm.
    5. **Database Impact**: Lưu ý về script migration, index mới hoặc cascade behavior.

---

## 📋 Checklist Rà Soát Nhanh Cho AI Agent (Spring Boot)

Trước khi xác nhận hoàn thành, Agent **bắt buộc** tự rà soát danh sách sau:

* [ ] **DTO Separation**: Không có Controller nào trả về trực tiếp class `@Entity`.
* [ ] **Validation**: Mọi request body đều có `@Valid` và các trường trong DTO có message lỗi tiếng Việt/Anh chuẩn mực.
* [ ] **Dependency Injection**: Sử dụng Constructor Injection (hoặc `@RequiredArgsConstructor` của Lombok), không dùng `@Autowired` trên field.
* [ ] **Transaction Boundary**: Mọi method thay đổi dữ liệu trong Service đều được đánh dấu `@Transactional`.
* [ ] **OpenAPI Spec**: Controller và DTO có đầy đủ annotation của `@Tag`, `@Operation`, `@ApiResponse`, `@Schema`.
* [ ] **JPA Fetch Type**: Mọi quan hệ `@ManyToOne`, `@OneToOne`, `@OneToMany` đều có `fetch = FetchType.LAZY` (tránh n+1 query không kiểm soát).
* [ ] **Exception Handling**: Có mapper bắt lỗi trong `@RestControllerAdvice` (đặc biệt là `MethodArgumentNotValidException`).
* [ ] **Build Status**: Lệnh build/test (`mvn test` hoặc `gradle test`) chạy thành công mà không có lỗi.