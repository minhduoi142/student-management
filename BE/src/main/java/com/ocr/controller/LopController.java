package com.ocr.controller;

import com.ocr.dto.request.LopRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.LopResponse;
import com.ocr.service.LopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lop")
@RequiredArgsConstructor
@Tag(name = "Quản lý Lớp học", description = "Các API thao tác danh sách Lớp học theo Khoa và kèm Giảng viên cố vấn")
public class LopController {

    private final LopService lopService;

    @GetMapping
    @Operation(summary = "Lấy danh sách Lớp học (kèm tên Khoa và Cố vấn học tập, hỗ trợ lọc theo Khoa)")
    public ResponseEntity<ApiResponse<List<LopResponse>>> getAllLop(
            @Parameter(description = "Mã khoa để lọc (ví dụ: CNTT, để trống nếu lấy tất cả)")
            @RequestParam(required = false) String maKhoa) {
        List<LopResponse> data = lopService.getAllLop(maKhoa);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách lớp thành công"));
    }

    @GetMapping("/{maLop}")
    @Operation(summary = "Lấy chi tiết một Lớp học theo mã")
    public ResponseEntity<ApiResponse<LopResponse>> getLopById(@PathVariable String maLop) {
        LopResponse data = lopService.getLopById(maLop);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy thông tin lớp thành công"));
    }

    @PostMapping
    @Operation(summary = "Tạo mới một Lớp học")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo lớp học thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy Mã khoa hoặc Mã giảng viên cố vấn"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Mã lớp đã tồn tại")
    })
    public ResponseEntity<ApiResponse<LopResponse>> createLop(@Valid @RequestBody LopRequest request) {
        LopResponse data = lopService.createLop(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Tạo mới lớp học thành công"));
    }

    @PutMapping("/{maLop}")
    @Operation(summary = "Cập nhật thông tin Lớp học")
    public ResponseEntity<ApiResponse<LopResponse>> updateLop(
            @PathVariable String maLop,
            @Valid @RequestBody LopRequest request) {
        LopResponse data = lopService.updateLop(maLop, request);
        return ResponseEntity.ok(ApiResponse.success(data, "Cập nhật lớp học thành công"));
    }

    @DeleteMapping("/{maLop}")
    @Operation(summary = "Xóa một Lớp học (kiểm tra không còn sinh viên)")
    public ResponseEntity<ApiResponse<Void>> deleteLop(@PathVariable String maLop) {
        lopService.deleteLop(maLop);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa lớp học thành công"));
    }
}
