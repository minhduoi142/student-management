package com.ocr.controller;

import com.ocr.dto.request.SinhVienProfileUpdateRequest;
import com.ocr.dto.request.SinhVienRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.PageResponse;
import com.ocr.dto.response.SinhVienResponse;
import com.ocr.service.SinhVienService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sinh-vien")
@RequiredArgsConstructor
@Tag(name = "Quản lý Hồ sơ Sinh viên", description = "Các API thao tác danh sách, tìm kiếm, phân trang và cập nhật hồ sơ sinh viên")
public class SinhVienController {

    private final SinhVienService sinhVienService;

    @GetMapping
    @Operation(summary = "Lấy danh sách sinh viên có phân trang, tìm kiếm và bộ lọc",
               description = "Hỗ trợ tìm kiếm theo Họ tên/Mã SV, lọc theo Lớp (Câu 1) và lọc theo Khoa (Câu 13)")
    public ResponseEntity<ApiResponse<PageResponse<SinhVienResponse>>> getStudents(
            @Parameter(description = "Từ khóa tìm kiếm (theo họ tên hoặc mã SV)")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Mã lớp để lọc (ví dụ: D24CQCE02-B)")
            @RequestParam(required = false) String maLop,
            @Parameter(description = "Mã khoa để lọc sinh viên toàn khoa (ví dụ: CNTT)")
            @RequestParam(required = false) String maKhoa,
            @ParameterObject
            @PageableDefault(size = 10, sort = "maSV", direction = Sort.Direction.ASC)
            Pageable pageable) {

        PageResponse<SinhVienResponse> data = sinhVienService.getStudents(keyword, maLop, maKhoa, pageable);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách sinh viên thành công"));
    }

    @GetMapping("/{maSV}")
    @Operation(summary = "Lấy chi tiết hồ sơ Sinh viên theo mã sinh viên")
    public ResponseEntity<ApiResponse<SinhVienResponse>> getStudentById(@PathVariable String maSV) {
        SinhVienResponse data = sinhVienService.getStudentById(maSV);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy hồ sơ sinh viên thành công"));
    }

    @PostMapping
    @Operation(summary = "Tạo mới một hồ sơ Sinh viên")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo sinh viên thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy Mã lớp"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Trùng mã sinh viên hoặc email")
    })
    public ResponseEntity<ApiResponse<SinhVienResponse>> createStudent(@Valid @RequestBody SinhVienRequest request) {
        SinhVienResponse data = sinhVienService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Tạo mới hồ sơ sinh viên thành công"));
    }

    @PutMapping("/{maSV}")
    @Operation(summary = "Cập nhật toàn bộ thông tin Sinh viên")
    public ResponseEntity<ApiResponse<SinhVienResponse>> updateStudent(
            @PathVariable String maSV,
            @Valid @RequestBody SinhVienRequest request) {
        SinhVienResponse data = sinhVienService.updateStudent(maSV, request);
        return ResponseEntity.ok(ApiResponse.success(data, "Cập nhật sinh viên thành công"));
    }

    @PatchMapping("/{maSV}/profile")
    @Operation(summary = "Cập nhật thông tin cá nhân sinh viên (SĐT, Địa chỉ, Email) - Ứng với Câu 11",
               description = "Chỉ cập nhật thông tin liên hệ mà không làm thay đổi mã sinh viên hoặc lớp học")
    public ResponseEntity<ApiResponse<SinhVienResponse>> updateProfile(
            @PathVariable String maSV,
            @Valid @RequestBody SinhVienProfileUpdateRequest request) {
        SinhVienResponse data = sinhVienService.updateProfile(maSV, request);
        return ResponseEntity.ok(ApiResponse.success(data, "Cập nhật thông tin cá nhân sinh viên thành công"));
    }

    @DeleteMapping("/{maSV}")
    @Operation(summary = "Xóa hồ sơ Sinh viên (tự động xóa kèm kết quả học tập liên quan)")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable String maSV) {
        sinhVienService.deleteStudent(maSV);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa hồ sơ sinh viên thành công"));
    }
}
