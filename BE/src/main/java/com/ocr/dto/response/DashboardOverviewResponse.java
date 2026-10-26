package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Số liệu tổng quan toàn trường phục vụ Dashboard Admin")
public record DashboardOverviewResponse(
    @Schema(description = "Tổng số khoa", example = "5")
    long tongSoKhoa,

    @Schema(description = "Tổng số giảng viên", example = "4")
    long tongSoGiangVien,

    @Schema(description = "Tổng số lớp học", example = "5")
    long tongSoLop,

    @Schema(description = "Tổng số sinh viên", example = "5")
    long tongSoSinhVien,

    @Schema(description = "Tổng số môn học", example = "6")
    long tongSoMonHoc,

    @Schema(description = "Tổng số học kỳ", example = "5")
    long tongSoHocKy,

    @Schema(description = "Tổng số bản ghi kết quả điểm", example = "5")
    long tongSoBanGhiDiem
) {}
