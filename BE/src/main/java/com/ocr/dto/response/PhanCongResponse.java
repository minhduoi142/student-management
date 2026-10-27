package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "Thông tin phân công giảng dạy của giảng viên")
public record PhanCongResponse(
    @Schema(description = "Mã phân công", example = "1")
    Long maPC,

    @Schema(description = "Mã giảng viên", example = "GV01")
    String maGV,

    @Schema(description = "Họ tên giảng viên", example = "ThS. Hoàng Văn Dũng")
    String tenGV,

    @Schema(description = "Mã môn học", example = "INT1313")
    String maMH,

    @Schema(description = "Tên môn học", example = "Cơ sở dữ liệu")
    String tenMH,

    @Schema(description = "Số tín chỉ", example = "3")
    Integer soTinChi,

    @Schema(description = "Mã lớp sinh viên", example = "D24CQCE02-B")
    String maLop,

    @Schema(description = "Tên lớp sinh viên", example = "Công nghệ thông tin 02 Khóa 2024")
    String tenLop,

    @Schema(description = "Mã học kỳ", example = "2024-1")
    String maHK,

    @Schema(description = "Tên học kỳ", example = "Học kỳ 1 năm học 2024 - 2025")
    String tenHK,

    @Schema(description = "Sĩ số lớp", example = "45")
    Integer siSo,

    @Schema(description = "Số sinh viên đã có điểm", example = "40")
    Integer soLuongCoDiem
) {}
