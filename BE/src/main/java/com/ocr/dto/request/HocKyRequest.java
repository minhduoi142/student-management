package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Yêu cầu tạo mới hoặc cập nhật Học kỳ")
public record HocKyRequest(
    @NotBlank(message = "Mã học kỳ không được để trống")
    @Size(max = 10, message = "Mã học kỳ tối đa 10 ký tự")
    @Schema(description = "Mã học kỳ (duy nhất)", example = "2025-1")
    String maHK,

    @NotBlank(message = "Năm học không được để trống")
    @Pattern(regexp = "^\\d{4}-\\d{4}$", message = "Năm học phải có định dạng YYYY-YYYY (ví dụ: 2025-2026)")
    @Schema(description = "Năm học", example = "2025-2026")
    String namHoc,

    @NotNull(message = "Kỳ học không được để trống")
    @Min(value = 1, message = "Kỳ học phải từ 1 đến 3 (1, 2 hoặc 3 - hè)")
    @Max(value = 3, message = "Kỳ học phải từ 1 đến 3 (1, 2 hoặc 3 - hè)")
    @Schema(description = "Học kỳ (1: kỳ 1, 2: kỳ 2, 3: kỳ hè)", example = "1")
    Integer ky
) {}
