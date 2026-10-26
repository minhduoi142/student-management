package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Thông tin sinh viên đạt điểm cuối kỳ cao theo môn học (Câu 8)")
public record SinhVienDiemGioiResponse(
    @Schema(description = "Mã sinh viên", example = "B24DCCE001")
    String maSV,

    @Schema(description = "Họ và tên", example = "Nguyễn Hoàng Nam")
    String hoTen,

    @Schema(description = "Tên lớp", example = "Kỹ thuật Máy tính 02 - Khóa 2024")
    String tenLop,

    @Schema(description = "Mã môn học", example = "INT1313")
    String maMH,

    @Schema(description = "Tên môn học", example = "Cơ sở dữ liệu")
    String tenMH,

    @Schema(description = "Điểm thi cuối kỳ", example = "9.00")
    BigDecimal diemCK,

    @Schema(description = "Điểm tổng kết môn học", example = "8.85")
    BigDecimal diemTongKet
) {}
