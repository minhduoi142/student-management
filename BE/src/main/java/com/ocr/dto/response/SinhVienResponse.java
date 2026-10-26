package com.ocr.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.ocr.entity.SinhVien;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDate;

@Schema(description = "Thông tin chi tiết của Sinh viên")
public record SinhVienResponse(
    @Schema(description = "Mã sinh viên", example = "B24DCCE001")
    String maSV,

    @Schema(description = "Họ và tên", example = "Nguyễn Hoàng Nam")
    String hoTen,

    @Schema(description = "Ngày sinh", example = "2006-03-15")
    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate ngaySinh,

    @Schema(description = "Giới tính", example = "Nam")
    String gioiTinh,

    @Schema(description = "Địa chỉ liên hệ", example = "Hà Nội")
    String diaChi,

    @Schema(description = "Email", example = "nam.nh@qlsv.edu.vn")
    String email,

    @Schema(description = "Số điện thoại", example = "0981234567")
    String soDienThoai,

    @Schema(description = "Mã lớp", example = "D24CQCE02-B")
    String maLop,

    @Schema(description = "Tên lớp", example = "Kỹ thuật Máy tính 02 - Khóa 2024")
    String tenLop,

    @Schema(description = "Mã khoa quản lý", example = "CNTT")
    String maKhoa,

    @Schema(description = "Tên khoa quản lý", example = "Công nghệ Thông tin 1")
    String tenKhoa
) {
    public static SinhVienResponse fromEntity(SinhVien sv) {
        if (sv == null) {
            return null;
        }
        return new SinhVienResponse(
            sv.getMaSV(),
            sv.getHoTen(),
            sv.getNgaySinh(),
            sv.getGioiTinh() != null ? sv.getGioiTinh().getValue() : null,
            sv.getDiaChi(),
            sv.getEmail(),
            sv.getSoDienThoai(),
            sv.getLop() != null ? sv.getLop().getMaLop() : null,
            sv.getLop() != null ? sv.getLop().getTenLop() : null,
            sv.getLop() != null && sv.getLop().getKhoa() != null ? sv.getLop().getKhoa().getMaKhoa() : null,
            sv.getLop() != null && sv.getLop().getKhoa() != null ? sv.getLop().getKhoa().getTenKhoa() : null
        );
    }
}
