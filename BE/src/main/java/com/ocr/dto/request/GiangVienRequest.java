package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu tạo mới hoặc cập nhật Giảng viên")
public record GiangVienRequest(
    @NotBlank(message = "Mã giảng viên không được để trống")
    @Size(max = 10, message = "Mã giảng viên tối đa 10 ký tự")
    @Schema(description = "Mã giảng viên (duy nhất)", example = "GV01")
    String maGV,

    @NotBlank(message = "Họ tên giảng viên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    @Schema(description = "Họ và tên giảng viên", example = "TS. Nguyễn Văn A")
    String hoTen,

    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    @Schema(description = "Email giảng viên", example = "nguyenvana@qlsv.edu.vn")
    String email,

    @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự")
    @Schema(description = "Số điện thoại liên hệ", example = "0987654321")
    String soDienThoai,

    @NotBlank(message = "Mã khoa không được để trống")
    @Size(max = 10, message = "Mã khoa tối đa 10 ký tự")
    @Schema(description = "Mã khoa công tác (phải tồn tại trong bảng KHOA)", example = "CNTT")
    String maKhoa
) {}
