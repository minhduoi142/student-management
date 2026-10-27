package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Schema(description = "Dòng điểm của một sinh viên trong lớp học phần")
public record LopHocPhanDiemItemResponse(
    @Schema(description = "Mã sinh viên", example = "B24DCCE001")
    String maSV,

    @Schema(description = "Họ và tên sinh viên", example = "Nguyễn Văn An")
    String hoTen,

    @Schema(description = "Ngày sinh")
    LocalDate ngaySinh,

    @Schema(description = "Trạng thái sinh viên", example = "DANG_HOC")
    String trangThai,

    @Schema(description = "Điểm chuyên cần (10%)", example = "9.00")
    BigDecimal diemCC,

    @Schema(description = "Điểm giữa kỳ (30%)", example = "8.50")
    BigDecimal diemGK,

    @Schema(description = "Điểm cuối kỳ (60%)", example = "8.00")
    BigDecimal diemCK,

    @Schema(description = "Điểm tổng kết", example = "8.25")
    BigDecimal diemTK,

    @Schema(description = "Điểm chữ", example = "B+")
    String diemChu,

    @Schema(description = "Đánh giá đạt", example = "true")
    Boolean dat
) {}
