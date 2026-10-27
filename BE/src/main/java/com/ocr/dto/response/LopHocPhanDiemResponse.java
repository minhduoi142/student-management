package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;

@Builder
@Schema(description = "Sổ điểm chi tiết theo lớp học phần")
public record LopHocPhanDiemResponse(
    @Schema(description = "Mã lớp", example = "D24CQCE02-B")
    String maLop,

    @Schema(description = "Tên lớp", example = "Công nghệ thông tin 02")
    String tenLop,

    @Schema(description = "Mã môn học", example = "INT1313")
    String maMH,

    @Schema(description = "Tên môn học", example = "Cơ sở dữ liệu")
    String tenMH,

    @Schema(description = "Số tín chỉ", example = "3")
    Integer soTinChi,

    @Schema(description = "Mã học kỳ", example = "2024-1")
    String maHK,

    @Schema(description = "Tên học kỳ", example = "Học kỳ 1 năm học 2024 - 2025")
    String tenHK,

    @Schema(description = "Mã giảng viên phụ trách", example = "GV01")
    String maGV,

    @Schema(description = "Họ tên giảng viên", example = "ThS. Hoàng Văn Dũng")
    String tenGV,

    @Schema(description = "Sĩ số lớp", example = "45")
    Integer siSo,

    @Schema(description = "Số sinh viên đã vào điểm", example = "42")
    Integer soLuongCoDiem,

    @Schema(description = "Danh sách sinh viên và điểm số")
    List<LopHocPhanDiemItemResponse> danhSachSinhVien
) {}
