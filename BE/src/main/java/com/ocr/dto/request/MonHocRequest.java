package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu tạo mới hoặc cập nhật Môn học")
public record MonHocRequest(
    @NotBlank(message = "Mã môn học không được để trống")
    @Size(max = 15, message = "Mã môn học tối đa 15 ký tự")
    @Schema(description = "Mã môn học (duy nhất)", example = "INT1313")
    String maMH,

    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 150, message = "Tên môn học tối đa 150 ký tự")
    @Schema(description = "Tên môn học", example = "Cơ sở dữ liệu")
    String tenMH,

    @NotNull(message = "Số tín chỉ không được để trống")
    @Min(value = 1, message = "Số tín chỉ phải lớn hơn 0")
    @Schema(description = "Số tín chỉ (phải lớn hơn 0)", example = "3")
    Integer soTinChi
) {}
