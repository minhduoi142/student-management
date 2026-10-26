package com.ocr.controller;

import com.ocr.dto.request.HocKyRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.HocKyResponse;
import com.ocr.service.HocKyService;
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
@RequestMapping("/api/v1/hoc-ky")
@RequiredArgsConstructor
@Tag(name = "Quản lý Học kỳ", description = "Các API thao tác danh mục Học kỳ và Năm học")
public class HocKyController {

    private final HocKyService hocKyService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả Học kỳ")
    public ResponseEntity<ApiResponse<List<HocKyResponse>>> getAllHocKy() {
        List<HocKyResponse> data = hocKyService.getAllHocKy();
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách học kỳ thành công"));
    }

    @GetMapping("/{maHK}")
    @Operation(summary = "Lấy chi tiết một Học kỳ theo mã")
    public ResponseEntity<ApiResponse<HocKyResponse>> getHocKyById(@PathVariable String maHK) {
        HocKyResponse data = hocKyService.getHocKyById(maHK);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy thông tin học kỳ thành công"));
    }

    @PostMapping
    @Operation(summary = "Tạo mới một Học kỳ")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo học kỳ thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Mã học kỳ hoặc cặp (Năm học, Kỳ) đã tồn tại")
    })
    public ResponseEntity<ApiResponse<HocKyResponse>> createHocKy(@Valid @RequestBody HocKyRequest request) {
        HocKyResponse data = hocKyService.createHocKy(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Tạo mới học kỳ thành công"));
    }

    @PutMapping("/{maHK}")
    @Operation(summary = "Cập nhật thông tin Học kỳ")
    public ResponseEntity<ApiResponse<HocKyResponse>> updateHocKy(
            @PathVariable String maHK,
            @Valid @RequestBody HocKyRequest request) {
        HocKyResponse data = hocKyService.updateHocKy(maHK, request);
        return ResponseEntity.ok(ApiResponse.success(data, "Cập nhật học kỳ thành công"));
    }

    @DeleteMapping("/{maHK}")
    @Operation(summary = "Xóa một Học kỳ")
    public ResponseEntity<ApiResponse<Void>> deleteHocKy(@PathVariable String maHK) {
        hocKyService.deleteHocKy(maHK);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa học kỳ thành công"));
    }
}
