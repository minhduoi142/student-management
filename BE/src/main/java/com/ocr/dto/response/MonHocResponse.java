package com.ocr.dto.response;

import com.ocr.entity.MonHoc;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin phản hồi của Môn học")
public record MonHocResponse(
    @Schema(description = "Mã môn học", example = "INT1313")
    String maMH,

    @Schema(description = "Tên môn học", example = "Cơ sở dữ liệu")
    String tenMH,

    @Schema(description = "Số tín chỉ", example = "3")
    Integer soTinChi
) {
    public static MonHocResponse fromEntity(MonHoc monHoc) {
        if (monHoc == null) {
            return null;
        }
        return new MonHocResponse(
            monHoc.getMaMH(),
            monHoc.getTenMH(),
            monHoc.getSoTinChi()
        );
    }
}
