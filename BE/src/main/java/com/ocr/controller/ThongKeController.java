package com.ocr.controller;

import com.ocr.dto.response.*;
import com.ocr.service.ThongKeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/thong-ke")
@RequiredArgsConstructor
@Tag(name = "Báo cáo & Thống kê Nghiệp vụ", description = "Các API phục vụ truy vấn nghiệp vụ phức tạp, báo cáo thống kê và Dashboard (Câu 6, 7, 8, 9, 10, 15)")
public class ThongKeController {

    private final ThongKeService thongKeService;

    @GetMapping("/dashboard")
    @Operation(summary = "Số liệu tổng quan toàn hệ thống (Dashboard KPIs)",
               description = "Thống kê tổng số lượng Khoa, Giảng viên, Lớp học, Sinh viên, Môn học, Học kỳ và Điểm")
    public ResponseEntity<ApiResponse<DashboardOverviewResponse>> getDashboardOverview() {
        DashboardOverviewResponse data = thongKeService.getDashboardOverview();
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy dữ liệu tổng quan hệ thống thành công"));
    }

    @GetMapping("/si-so-lop")
    @Operation(summary = "Thống kê sĩ số sinh viên trong từng lớp (Câu 6)",
               description = "Liệt kê danh sách tất cả các lớp học kèm theo sĩ số sinh viên hiện có, sắp xếp giảm dần")
    public ResponseEntity<ApiResponse<List<SiSoLopResponse>>> getSiSoLop() {
        List<SiSoLopResponse> data = thongKeService.getSiSoLop();
        return ResponseEntity.ok(ApiResponse.success(data, "Thống kê sĩ số lớp thành công"));
    }

    @GetMapping("/diem-trung-binh-mon")
    @Operation(summary = "Tính điểm thi cuối kỳ trung bình của từng môn học (Câu 7)",
               description = "Tính điểm trung bình điểm thi cuối kỳ (DiemCK) cho từng môn học và đếm số lượng sinh viên đã học")
    public ResponseEntity<ApiResponse<List<DiemTrungBinhMonResponse>>> getDiemTrungBinhMon() {
        List<DiemTrungBinhMonResponse> data = thongKeService.getDiemTrungBinhMon();
        return ResponseEntity.ok(ApiResponse.success(data, "Thống kê điểm trung bình môn học thành công"));
    }

    @GetMapping("/sinh-vien-diem-cao")
    @Operation(summary = "Tìm sinh viên có điểm thi cuối kỳ >= 8.0 ở môn cụ thể (Câu 8)",
               description = "Lọc danh sách sinh viên có điểm thi cuối kỳ đạt từ ngưỡng điểm chỉ định trở lên (mặc định 8.00)")
    public ResponseEntity<ApiResponse<List<SinhVienDiemGioiResponse>>> getSinhVienDiemCao(
            @Parameter(description = "Mã môn học cần lọc (ví dụ: INT1313)", required = true)
            @RequestParam String maMH,
            @Parameter(description = "Ngưỡng điểm cuối kỳ tối thiểu (mặc định: 8.00)")
            @RequestParam(required = false, defaultValue = "8.00") BigDecimal minDiemCK) {
        List<SinhVienDiemGioiResponse> data = thongKeService.getSinhVienDiemCao(maMH, minDiemCK);
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách sinh viên đạt điểm cao thành công"));
    }

    @GetMapping("/sinh-vien-chua-co-diem")
    @Operation(summary = "Liệt kê sinh viên chưa có bản ghi kết quả nào (Câu 9)",
               description = "Tìm các sinh viên chưa từng có bản ghi điểm nào trong hệ thống (nợ bảng điểm)")
    public ResponseEntity<ApiResponse<List<SinhVienResponse>>> getSinhVienChuaCoDiem() {
        List<SinhVienResponse> data = thongKeService.getSinhVienChuaCoDiem();
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách sinh viên chưa có điểm thành công"));
    }

    @GetMapping("/so-luong-diem-theo-hoc-ky")
    @Operation(summary = "Thống kê số lượng bản ghi kết quả theo từng học kỳ (Câu 10)",
               description = "Đếm tổng số lượt điểm học phần đã được nhập phân theo từng năm học và kỳ học")
    public ResponseEntity<ApiResponse<List<ThongKeHocKyResponse>>> getThongKeSoLuongKetQuaTheoHocKy() {
        List<ThongKeHocKyResponse> data = thongKeService.getThongKeSoLuongKetQuaTheoHocKy();
        return ResponseEntity.ok(ApiResponse.success(data, "Thống kê lượt nhập điểm theo học kỳ thành công"));
    }

    @GetMapping("/mon-hoc-chua-co-ket-qua")
    @Operation(summary = "Tìm môn học chưa có sinh viên nào có kết quả (Câu 15)",
               description = "Tìm các môn học trong chương trình đào tạo mà chưa có bất kỳ sinh viên nào có kết quả điểm")
    public ResponseEntity<ApiResponse<List<MonHocResponse>>> getMonHocChuaCoKetQua() {
        List<MonHocResponse> data = thongKeService.getMonHocChuaCoKetQua();
        return ResponseEntity.ok(ApiResponse.success(data, "Lấy danh sách môn học chưa có kết quả thành công"));
    }
}
