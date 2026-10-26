package com.ocr.dto.request;

import com.ocr.entity.enums.GioiTinh;
import com.ocr.entity.enums.TrangThaiSinhVienEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

@Schema(description = "Yêu cầu tạo mới hoặc cập nhật toàn diện hồ sơ Sinh viên")
public record SinhVienRequest(
    @NotBlank(message = "Mã sinh viên không được để trống")
    @Size(max = 15, message = "Mã sinh viên tối đa 15 ký tự")
    @Schema(description = "Mã sinh viên duy nhất", example = "B24DCCE001")
    String maSV,

    @NotBlank(message = "Họ tên sinh viên không được để trống")
    @Size(max = 100, message = "Họ tên sinh viên tối đa 100 ký tự")
    @Schema(description = "Họ và tên sinh viên", example = "Nguyễn Hoàng Nam")
    String hoTen,

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải là ngày trong quá khứ")
    @Schema(description = "Ngày sinh của sinh viên", example = "2006-03-15")
    LocalDate ngaySinh,

    @NotNull(message = "Giới tính không được để trống")
    @Schema(description = "Giới tính sinh viên: 'Nam' hoặc 'Nữ'", example = "Nam")
    GioiTinh gioiTinh,

    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    @Schema(description = "Địa chỉ liên hệ thường trú", example = "Hà Nội")
    String diaChi,

    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    @Schema(description = "Email sinh viên (duy nhất nếu có)", example = "nam.nh@qlsv.edu.vn")
    String email,

    @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự")
    @Schema(description = "Số điện thoại liên lạc", example = "0981234567")
    String soDienThoai,

    @NotBlank(message = "Mã lớp không được để trống")
    @Size(max = 15, message = "Mã lớp tối đa 15 ký tự")
    @Schema(description = "Mã lớp sinh viên đang theo học (phải tồn tại trong bảng LOP)", example = "D24CQCE02-B")
    String maLop,

    @Schema(description = "Trạng thái học tập của sinh viên: DANG_HOC, BAO_LUU, TOT_NGHIEP, BUOC_THOI_HOC", example = "DANG_HOC")
    TrangThaiSinhVienEnum trangThai
) {
    public SinhVienRequest {
        if (trangThai == null) {
            trangThai = TrangThaiSinhVienEnum.DANG_HOC;
        }
    }

    public SinhVienRequest(String maSV, String hoTen, LocalDate ngaySinh, GioiTinh gioiTinh, String diaChi, String email, String soDienThoai, String maLop) {
        this(maSV, hoTen, ngaySinh, gioiTinh, diaChi, email, soDienThoai, maLop, TrangThaiSinhVienEnum.DANG_HOC);
    }
}
