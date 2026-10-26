package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Thống kê điểm thi cuối kỳ trung bình theo môn học (Câu 7)")
public record DiemTrungBinhMonResponse(
    @Schema(description = "Mã môn học", example = "INT1313")
    String maMH,

    @Schema(description = "Tên môn học", example = "Cơ sở dữ liệu")
    String tenMH,

    @Schema(description = "Số tín chỉ", example = "3")
    Integer soTinChi,

    @Schema(description = "Điểm thi cuối kỳ trung bình", example = "7.85")
    BigDecimal diemCKTrungBinh,

    @Schema(description = "Số lượng sinh viên đã có điểm cuối kỳ", example = "42")
    long soLuongSinhVien
) {}
