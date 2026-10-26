package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu tạo mới hoặc cập nhật Khoa")
public record KhoaRequest(
    @NotBlank(message = "Mã khoa không được để trống")
    @Size(max = 10, message = "Mã khoa tối đa 10 ký tự")
    @Schema(description = "Mã khoa (duy nhất)", example = "CNTT")
    String maKhoa,

    @NotBlank(message = "Tên khoa không được để trống")
    @Size(max = 100, message = "Tên khoa tối đa 100 ký tự")
    @Schema(description = "Tên khoa (duy nhất)", example = "Công nghệ Thông tin")
    String tenKhoa
) {}
