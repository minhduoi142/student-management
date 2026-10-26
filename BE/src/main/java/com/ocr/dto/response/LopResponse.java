package com.ocr.dto.response;

import com.ocr.entity.Lop;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin phản hồi của Lớp học")
public record LopResponse(
    @Schema(description = "Mã lớp", example = "D24CQCE02-B")
    String maLop,

    @Schema(description = "Tên lớp", example = "Kỹ thuật Máy tính 02 - Khóa 2024")
    String tenLop,

    @Schema(description = "Khóa học", example = "2024")
    Integer khoaHoc,

    @Schema(description = "Mã khoa", example = "CNTT")
    String maKhoa,

    @Schema(description = "Tên khoa", example = "Công nghệ Thông tin 1")
    String tenKhoa,

    @Schema(description = "Mã giảng viên cố vấn", example = "GV01")
    String maGVCoVan,

    @Schema(description = "Tên giảng viên cố vấn", example = "TS. Nguyễn Văn A")
    String tenGVCoVan
) {
    public static LopResponse fromEntity(Lop lop) {
        if (lop == null) {
            return null;
        }
        return new LopResponse(
            lop.getMaLop(),
            lop.getTenLop(),
            lop.getKhoaHoc(),
            lop.getKhoa() != null ? lop.getKhoa().getMaKhoa() : null,
            lop.getKhoa() != null ? lop.getKhoa().getTenKhoa() : null,
            lop.getCoVanHocTap() != null ? lop.getCoVanHocTap().getMaGV() : null,
            lop.getCoVanHocTap() != null ? lop.getCoVanHocTap().getHoTen() : null
        );
    }
}
