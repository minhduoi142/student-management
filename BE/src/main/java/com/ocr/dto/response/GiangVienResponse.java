package com.ocr.dto.response;

import com.ocr.entity.GiangVien;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin phản hồi của Giảng viên")
public record GiangVienResponse(
    @Schema(description = "Mã giảng viên", example = "GV01")
    String maGV,

    @Schema(description = "Họ và tên giảng viên", example = "TS. Nguyễn Văn A")
    String hoTen,

    @Schema(description = "Email giảng viên", example = "nguyenvana@qlsv.edu.vn")
    String email,

    @Schema(description = "Số điện thoại", example = "0987654321")
    String soDienThoai,

    @Schema(description = "Mã khoa công tác", example = "CNTT")
    String maKhoa,

    @Schema(description = "Tên khoa công tác", example = "Công nghệ Thông tin 1")
    String tenKhoa
) {
    public static GiangVienResponse fromEntity(GiangVien gv) {
        if (gv == null) {
            return null;
        }
        return new GiangVienResponse(
            gv.getMaGV(),
            gv.getHoTen(),
            gv.getEmail(),
            gv.getSoDienThoai(),
            gv.getKhoa() != null ? gv.getKhoa().getMaKhoa() : null,
            gv.getKhoa() != null ? gv.getKhoa().getTenKhoa() : null
        );
    }
}
