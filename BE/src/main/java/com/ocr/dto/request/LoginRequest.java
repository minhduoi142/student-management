package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu đăng nhập hệ thống")
public record LoginRequest(
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(max = 50, message = "Tên đăng nhập tối đa 50 ký tự")
    @Schema(description = "Tên đăng nhập", example = "admin")
    String username,

    @NotBlank(message = "Mật khẩu không được để trống")
    @Schema(description = "Mật khẩu người dùng", example = "admin123")
    String password
) {}
