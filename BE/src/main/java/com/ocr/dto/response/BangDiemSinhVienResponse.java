package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "Bảng điểm chi tiết toàn khóa hoặc theo học kỳ của sinh viên (Câu 4, 5)")
public record BangDiemSinhVienResponse(
    @Schema(description = "Mã sinh viên", example = "B24DCCE001")
    String maSV,

    @Schema(description = "Họ và tên", example = "Nguyễn Hoàng Nam")
    String hoTen,

    @Schema(description = "Mã lớp", example = "D24CQCE02-B")
    String maLop,

    @Schema(description = "Tên lớp", example = "Kỹ thuật Máy tính 02 - Khóa 2024")
    String tenLop,

    @Schema(description = "Tên khoa", example = "Công nghệ Thông tin 1")
    String tenKhoa,

    @Schema(description = "Danh sách điểm các môn học")
    List<KetQuaResponse> danhSachDiem,

    @Schema(description = "Tổng số tín chỉ đã tích lũy (các môn đạt >= 4.0)", example = "9")
    Integer tongTinChiTichLuy,

    @Schema(description = "Điểm trung bình tích lũy hệ 10 (tính theo trọng số tín chỉ)", example = "8.65")
    BigDecimal diemTrungBinhTichLuy
) {}
