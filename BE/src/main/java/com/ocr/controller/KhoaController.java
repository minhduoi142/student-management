package com.ocr.controller;

import com.ocr.dto.request.KhoaRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.KhoaResponse;
import com.ocr.service.KhoaService;
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
@RequestMapping("/api/v1/khoa")
@RequiredArgsConstructor
@Tag(name = "Quản lý Khoa", description = "Các API thao tác danh mục Khoa trong trường")
public class KhoaController {

    private final KhoaService khoaService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả Khoa")
    public ResponseEntity<ApiResponse<List<KhoaResponse>>> getAllKhoa() {
        List<KhoaResponse> data = khoaService.getAllKhoa();
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách khoa thành công"));
    }

    @GetMapping("/{maKhoa}")
    @Operation(summary = "Lấy chi tiết một Khoa theo mã")
    public ResponseEntity<ApiResponse<KhoaResponse>> getKhoaById(@PathVariable String maKhoa) {
        KhoaResponse data = khoaService.getKhoaById(maKhoa);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy thông tin khoa thành công"));
    }

    @PostMapping
    @Operation(summary = "Tạo mới một Khoa")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo khoa thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Mã hoặc tên khoa đã tồn tại")
    })
    public ResponseEntity<ApiResponse<KhoaResponse>> createKhoa(@Valid @RequestBody KhoaRequest request) {
        KhoaResponse data = khoaService.createKhoa(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Tạo mới khoa thành công"));
    }

    @PutMapping("/{maKhoa}")
    @Operation(summary = "Cập nhật thông tin Khoa")
    public ResponseEntity<ApiResponse<KhoaResponse>> updateKhoa(
            @PathVariable String maKhoa,
            @Valid @RequestBody KhoaRequest request) {
        KhoaResponse data = khoaService.updateKhoa(maKhoa, request);
        return ResponseEntity.ok(ApiResponse.success(data, "Cập nhật khoa thành công"));
    }

    @DeleteMapping("/{maKhoa}")
    @Operation(summary = "Xóa một Khoa")
    public ResponseEntity<ApiResponse<Void>> deleteKhoa(@PathVariable String maKhoa) {
        khoaService.deleteKhoa(maKhoa);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa khoa thành công"));
    }
}
