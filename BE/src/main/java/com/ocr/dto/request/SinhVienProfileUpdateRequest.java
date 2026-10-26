package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu cập nhật thông tin cá nhân sinh viên (Địa chỉ, SĐT, Email)")
public record SinhVienProfileUpdateRequest(
    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    @Schema(description = "Địa chỉ liên hệ thường trú mới", example = "Số 123 Đường Cầu Giấy, Hà Nội")
    String diaChi,

    @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự")
    @Schema(description = "Số điện thoại liên lạc mới", example = "0987654321")
    String soDienThoai,

    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    @Schema(description = "Email mới", example = "nam.nguyen@qlsv.edu.vn")
    String email
) {}
