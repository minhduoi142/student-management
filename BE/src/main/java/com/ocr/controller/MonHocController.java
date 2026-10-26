package com.ocr.controller;

import com.ocr.dto.request.MonHocRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.MonHocResponse;
import com.ocr.service.MonHocService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mon-hoc")
@RequiredArgsConstructor
@Tag(name = "Quản lý Môn học", description = "Các API thao tác danh mục Môn học và Số tín chỉ")
public class MonHocController {

    private final MonHocService monHocService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả Môn học")
    public ResponseEntity<ApiResponse<List<MonHocResponse>>> getAllMonHoc() {
        List<MonHocResponse> data = monHocService.getAllMonHoc();
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách môn học thành công"));
    }

    @GetMapping("/{maMH}")
    @Operation(summary = "Lấy chi tiết một Môn học theo mã")
    public ResponseEntity<ApiResponse<MonHocResponse>> getMonHocById(@PathVariable String maMH) {
        MonHocResponse data = monHocService.getMonHocById(maMH);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy thông tin môn học thành công"));
    }

    @PostMapping
    @Operation(summary = "Tạo mới một Môn học")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo môn học thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Mã hoặc tên môn học đã tồn tại")
    })
    public ResponseEntity<ApiResponse<MonHocResponse>> createMonHoc(@Valid @RequestBody MonHocRequest request) {
        MonHocResponse data = monHocService.createMonHoc(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Tạo mới môn học thành công"));
    }

    @PutMapping("/{maMH}")
    @Operation(summary = "Cập nhật thông tin Môn học")
    public ResponseEntity<ApiResponse<MonHocResponse>> updateMonHoc(
            @PathVariable String maMH,
            @Valid @RequestBody MonHocRequest request) {
        MonHocResponse data = monHocService.updateMonHoc(maMH, request);
        return ResponseEntity.ok(ApiResponse.success(data, "Cập nhật môn học thành công"));
    }

    @DeleteMapping("/{maMH}")
    @Operation(summary = "Xóa một Môn học")
    public ResponseEntity<ApiResponse<Void>> deleteMonHoc(@PathVariable String maMH) {
        monHocService.deleteMonHoc(maMH);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa môn học thành công"));
    }
}
