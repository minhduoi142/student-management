package com.ocr.controller;

import com.ocr.dto.request.GiangVienRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.GiangVienResponse;
import com.ocr.dto.response.PhanCongResponse;
import com.ocr.service.GiangVienService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/giang-vien")
@RequiredArgsConstructor
@Tag(name = "Quản lý Giảng viên", description = "Các API thao tác danh sách Giảng viên theo Khoa và phân công giảng dạy")
public class GiangVienController {

    private final GiangVienService giangVienService;

    @GetMapping
    @Operation(summary = "Lấy danh sách Giảng viên (hỗ trợ lọc theo Khoa)")
    public ResponseEntity<ApiResponse<List<GiangVienResponse>>> getAllGiangVien(
            @Parameter(description = "Mã khoa để lọc (ví dụ: CNTT, để trống nếu lấy tất cả)")
            @RequestParam(required = false) String maKhoa) {
        List<GiangVienResponse> data = giangVienService.getAllGiangVien(maKhoa);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách giảng viên thành công"));
    }

    @GetMapping("/{maGV}")
    @Operation(summary = "Lấy chi tiết một Giảng viên theo mã")
    public ResponseEntity<ApiResponse<GiangVienResponse>> getGiangVienById(@PathVariable String maGV) {
        GiangVienResponse data = giangVienService.getGiangVienById(maGV);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy thông tin giảng viên thành công"));
    }

    @GetMapping("/{maGV}/phan-cong")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('GIANGVIEN') and @securityService.isTeacherOwner(#maGV))")
    @Operation(summary = "Lấy danh sách các lớp học phần được phân công của Giảng viên")
    public ResponseEntity<ApiResponse<List<PhanCongResponse>>> getPhanCongByGiangVien(
            @PathVariable String maGV,
            @Parameter(description = "Mã học kỳ (để trống nếu lấy tất cả kỳ)")
            @RequestParam(required = false) String maHK) {
        List<PhanCongResponse> data = giangVienService.getPhanCongByGiangVien(maGV, maHK);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách phân công giảng dạy thành công"));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo mới một Giảng viên")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo giảng viên thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy Mã khoa"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Trùng mã giảng viên hoặc email")
    })
    public ResponseEntity<ApiResponse<GiangVienResponse>> createGiangVien(@Valid @RequestBody GiangVienRequest request) {
        GiangVienResponse data = giangVienService.createGiangVien(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Tạo mới giảng viên thành công"));
    }

    @PutMapping("/{maGV}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin Giảng viên")
    public ResponseEntity<ApiResponse<GiangVienResponse>> updateGiangVien(
            @PathVariable String maGV,
            @Valid @RequestBody GiangVienRequest request) {
        GiangVienResponse data = giangVienService.updateGiangVien(maGV, request);
        return ResponseEntity.ok(ApiResponse.success(data, "Cập nhật giảng viên thành công"));
    }

    @DeleteMapping("/{maGV}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa một Giảng viên")
    public ResponseEntity<ApiResponse<Void>> deleteGiangVien(@PathVariable String maGV) {
        giangVienService.deleteGiangVien(maGV);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa giảng viên thành công"));
    }
}
