package com.ocr.dto.response;

import com.ocr.entity.Khoa;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin phản hồi của Khoa")
public record KhoaResponse(
    @Schema(description = "Mã khoa", example = "CNTT")
    String maKhoa,

    @Schema(description = "Tên khoa", example = "Công nghệ Thông tin")
    String tenKhoa
) {
    public static KhoaResponse fromEntity(Khoa khoa) {
        if (khoa == null) {
            return null;
        }
        return new KhoaResponse(
            khoa.getMaKhoa(),
            khoa.getTenKhoa()
        );
    }
}
