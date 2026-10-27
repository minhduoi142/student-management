package com.ocr.controller;

import com.ocr.dto.request.BatchKetQuaRequest;
import com.ocr.dto.request.KetQuaRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.BangDiemSinhVienResponse;
import com.ocr.dto.response.KetQuaResponse;
import com.ocr.dto.response.LopHocPhanDiemResponse;
import com.ocr.service.KetQuaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diem")
@RequiredArgsConstructor
@Tag(name = "Quản lý Điểm & Kết quả Học tập", description = "Các API nhập điểm, cập nhật điểm, tra cứu bảng điểm sinh viên và điểm theo môn học / lớp học phần")
public class KetQuaController {

    private final KetQuaService ketQuaService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or (hasRole('GIANGVIEN') and @securityService.canTeacherGrade(authentication.name, #dto.maMH, #dto.maLop, #dto.maHK))")
    @Operation(summary = "Nhập hoặc cập nhật điểm học phần cho sinh viên (Câu 12, 14)",
               description = "Nhập hoặc sửa các thành phần điểm CC, GK, CK cho sinh viên theo môn và học kỳ. Điểm tổng kết được tự động tính: CC*0.1 + GK*0.3 + CK*0.6")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lưu điểm thành công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Điểm không trong khoảng 0.00 đến 10.00 hoặc dữ liệu không hợp lệ"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền nhập điểm do chưa được phân công"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy Sinh viên, Môn học hoặc Học kỳ tương ứng")
    })
    public ResponseEntity<ApiResponse<KetQuaResponse>> saveOrUpdateDiem(@Valid @RequestBody KetQuaRequest dto) {
        KetQuaResponse data = ketQuaService.saveOrUpdateDiem(dto);
        return ResponseEntity.ok(ApiResponse.success(data, "Lưu kết quả điểm thành công"));
    }

    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('GIANGVIEN') and @securityService.canTeacherGrade(authentication.name, #request.maMH(), #request.maLop(), #request.maHK()))")
    @Operation(summary = "Nhập hoặc cập nhật điểm hàng loạt cho lớp học phần",
               description = "Lưu sổ điểm nhiều sinh viên trong một lớp học phần trong 1 request")
    public ResponseEntity<ApiResponse<List<KetQuaResponse>>> saveBatchDiem(@Valid @RequestBody BatchKetQuaRequest request) {
        List<KetQuaResponse> data = ketQuaService.saveBatchDiem(request);
        return ResponseEntity.ok(ApiResponse.success(data, "Lưu danh sách điểm thành công"));
    }

    @GetMapping("/sinh-vien/{maSV}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('GIANGVIEN') or (hasRole('SINHVIEN') and @securityService.isStudentOwner(#maSV))")
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('GIANGVIEN')")
    @Operation(summary = "Tra cứu danh sách điểm sinh viên theo môn học",
               description = "Xem danh sách điểm của tất cả sinh viên đã học môn này (hỗ trợ lọc theo học kỳ)")
    public ResponseEntity<ApiResponse<List<KetQuaResponse>>> getDiemByMonHoc(
            @PathVariable String maMH,
            @Parameter(description = "Mã học kỳ (ví dụ: 2024-1, để trống nếu lấy toàn bộ các kỳ)")
            @RequestParam(required = false) String maHK) {
        List<KetQuaResponse> data = ketQuaService.getDiemByMonHoc(maMH, maHK);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách điểm theo môn học thành công"));
    }

    @GetMapping("/lop-hoc-phan")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('GIANGVIEN') and @securityService.canTeacherGrade(authentication.name, #maMH, #maLop, #maHK))")
    @Operation(summary = "Lấy sổ điểm chi tiết của lớp học phần",
               description = "Xem danh sách sinh viên của lớp kèm toàn bộ các cột điểm CC, GK, CK, TK phục vụ Giảng viên nhập điểm")
    public ResponseEntity<ApiResponse<LopHocPhanDiemResponse>> getDiemLopHocPhan(
            @Parameter(description = "Mã lớp sinh viên", example = "D24CQCE02-B", required = true)
            @RequestParam String maLop,
            @Parameter(description = "Mã môn học", example = "INT1313", required = true)
            @RequestParam String maMH,
            @Parameter(description = "Mã học kỳ", example = "2024-1", required = true)
            @RequestParam String maHK) {
        LopHocPhanDiemResponse data = ketQuaService.getDiemLopHocPhan(maLop, maMH, maHK);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy sổ điểm lớp học phần thành công"));
    }

    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
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
