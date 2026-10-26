package com.ocr.dto.response;

import com.ocr.entity.KetQua;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Thông tin chi tiết điểm học phần của sinh viên")
public record KetQuaResponse(
    @Schema(description = "Mã sinh viên", example = "B24DCCE001")
    String maSV,

    @Schema(description = "Họ tên sinh viên", example = "Nguyễn Hoàng Nam")
    String hoTenSV,

    @Schema(description = "Mã lớp", example = "D24CQCE02-B")
    String maLop,

    @Schema(description = "Mã môn học", example = "INT1313")
    String maMH,

    @Schema(description = "Tên môn học", example = "Cơ sở dữ liệu")
    String tenMH,

    @Schema(description = "Số tín chỉ", example = "3")
    Integer soTinChi,

    @Schema(description = "Mã học kỳ", example = "2024-1")
    String maHK,

    @Schema(description = "Tên học kỳ", example = "Học kỳ 1 - Năm học 2024-2025")
    String tenHocKy,

    @Schema(description = "Điểm chuyên cần", example = "9.00")
    BigDecimal diemCC,

    @Schema(description = "Điểm giữa kỳ", example = "8.50")
    BigDecimal diemGK,

    @Schema(description = "Điểm cuối kỳ", example = "9.00")
    BigDecimal diemCK,

    @Schema(description = "Điểm tổng kết (hệ 10: CC*0.1 + GK*0.3 + CK*0.6)", example = "8.85")
    BigDecimal diemTongKet,

    @Schema(description = "Đánh giá kết quả (Đạt / Trượt / Chưa hoàn thành)", example = "Đạt")
    String danhGia
) {
    public static KetQuaResponse fromEntity(KetQua kq) {
        if (kq == null) {
            return null;
        }

        BigDecimal tongKet = kq.getDiemTongKet();
        String danhGia;
        if (tongKet == null) {
            danhGia = "Chưa hoàn thành";
        } else if (tongKet.compareTo(new BigDecimal("4.00")) >= 0) {
            danhGia = "Đạt";
        } else {
            danhGia = "Trượt";
        }

        return new KetQuaResponse(
            kq.getSinhVien() != null ? kq.getSinhVien().getMaSV() : (kq.getId() != null ? kq.getId().getMaSV() : null),
            kq.getSinhVien() != null ? kq.getSinhVien().getHoTen() : null,
            kq.getSinhVien() != null && kq.getSinhVien().getLop() != null ? kq.getSinhVien().getLop().getMaLop() : null,
            kq.getMonHoc() != null ? kq.getMonHoc().getMaMH() : (kq.getId() != null ? kq.getId().getMaMH() : null),
            kq.getMonHoc() != null ? kq.getMonHoc().getTenMH() : null,
            kq.getMonHoc() != null ? kq.getMonHoc().getSoTinChi() : null,
            kq.getHocKy() != null ? kq.getHocKy().getMaHK() : (kq.getId() != null ? kq.getId().getMaHK() : null),
            kq.getHocKy() != null ? kq.getHocKy().getTenHocKy() : null,
            kq.getDiemCC(),
            kq.getDiemGK(),
            kq.getDiemCK(),
            tongKet,
            danhGia
        );
    }
}
