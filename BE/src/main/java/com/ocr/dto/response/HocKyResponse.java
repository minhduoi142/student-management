package com.ocr.dto.response;

import com.ocr.entity.HocKy;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin phản hồi của Học kỳ")
public record HocKyResponse(
    @Schema(description = "Mã học kỳ", example = "2025-1")
    String maHK,

    @Schema(description = "Năm học", example = "2025-2026")
    String namHoc,

    @Schema(description = "Kỳ học", example = "1")
    Integer ky,

    @Schema(description = "Tên học kỳ dẫn xuất", example = "Học kỳ 1 - Năm học 2025-2026")
    String tenHocKy
) {
    public static HocKyResponse fromEntity(HocKy hocKy) {
        if (hocKy == null) {
            return null;
        }
        return new HocKyResponse(
            hocKy.getMaHK(),
            hocKy.getNamHoc(),
            hocKy.getKy(),
            hocKy.getTenHocKy()
        );
    }
}
