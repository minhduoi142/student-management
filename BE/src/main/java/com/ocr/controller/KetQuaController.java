package com.ocr.controller;

import com.ocr.dto.request.KetQuaRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.BangDiemSinhVienResponse;
import com.ocr.dto.response.KetQuaResponse;
import com.ocr.service.KetQuaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diem")
@RequiredArgsConstructor
@Tag(name = "Quản lý Điểm & Kết quả Học tập", description = "Các API nhập điểm, cập nhật điểm, tra cứu bảng điểm sinh viên và điểm theo môn học")
public class KetQuaController {

    private final KetQuaService ketQuaService;

    @PostMapping
    @Operation(summary = "Nhập hoặc cập nhật điểm học phần cho sinh viên (Câu 12, 14)",
               description = "Nhập hoặc sửa các thành phần điểm CC, GK, CK cho sinh viên theo môn và học kỳ. Điểm tổng kết được tự động tính: CC*0.1 + GK*0.3 + CK*0.6")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lưu điểm thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Điểm không trong khoảng 0.00 đến 10.00 hoặc dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy Sinh viên, Môn học hoặc Học kỳ tương ứng")
    })
    public ResponseEntity<ApiResponse<KetQuaResponse>> saveOrUpdateDiem(@Valid @RequestBody KetQuaRequest request) {
        KetQuaResponse data = ketQuaService.saveOrUpdateDiem(request);
        return ResponseEntity.ok(ApiResponse.success(data, "Lưu kết quả điểm thành công"));
    }

    @GetMapping("/sinh-vien/{maSV}")
    @Operation(summary = "Tra cứu toàn bộ bảng điểm của một sinh viên (Câu 4, 5)",
               description = "Xem chi tiết bảng điểm các môn, tính điểm tổng kết từng môn, tổng tín chỉ tích lũy và điểm trung bình tích lũy hệ 10 (hỗ trợ lọc theo từng học kỳ)")
    public ResponseEntity<ApiResponse<BangDiemSinhVienResponse>> getBangDiemSinhVien(
            @PathVariable String maSV,
            @Parameter(description = "Mã học kỳ (ví dụ: 2024-1, để trống nếu tra cứu toàn khóa)")
            @RequestParam(required = false) String maHK) {
        BangDiemSinhVienResponse data = ketQuaService.getBangDiemSinhVien(maSV, maHK);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy bảng điểm sinh viên thành công"));
    }

    @GetMapping("/mon-hoc/{maMH}")
    @Operation(summary = "Tra cứu danh sách điểm sinh viên theo môn học",
               description = "Xem danh sách điểm của tất cả sinh viên đã học môn này (hỗ trợ lọc theo học kỳ)")
    public ResponseEntity<ApiResponse<List<KetQuaResponse>>> getDiemByMonHoc(
            @PathVariable String maMH,
            @Parameter(description = "Mã học kỳ (ví dụ: 2024-1, để trống nếu lấy toàn bộ các kỳ)")
            @RequestParam(required = false) String maHK) {
        List<KetQuaResponse> data = ketQuaService.getDiemByMonHoc(maMH, maHK);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách điểm theo môn học thành công"));
    }

    @DeleteMapping
    @Operation(summary = "Xóa một bản ghi điểm theo bộ ba khóa (MaSV, MaMH, MaHK)")
    public ResponseEntity<ApiResponse<Void>> deleteDiem(
            @Parameter(description = "Mã sinh viên", example = "B24DCCE001", required = true)
            @RequestParam String maSV,
            @Parameter(description = "Mã môn học", example = "INT1313", required = true)
            @RequestParam String maMH,
            @Parameter(description = "Mã học kỳ", example = "2024-1", required = true)
            @RequestParam String maHK) {
        ketQuaService.deleteDiem(maSV, maMH, maHK);
        return ResponseEntity.ok(ApiResponse.success(null, "Xóa bản ghi điểm thành công"));
    }
}
