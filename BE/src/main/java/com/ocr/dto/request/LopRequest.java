package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Yêu cầu tạo mới hoặc cập nhật Lớp học")
public record LopRequest(
    @NotBlank(message = "Mã lớp không được để trống")
    @Size(max = 15, message = "Mã lớp tối đa 15 ký tự")
    @Schema(description = "Mã lớp (duy nhất)", example = "D24CQCE02-B")
    String maLop,

    @NotBlank(message = "Tên lớp không được để trống")
    @Size(max = 100, message = "Tên lớp tối đa 100 ký tự")
    @Schema(description = "Tên lớp", example = "Kỹ thuật Máy tính 02 - Khóa 2024")
    String tenLop,

    @NotNull(message = "Khóa học không được để trống")
    @Min(value = 2000, message = "Khóa học phải từ năm 2000")
    @Max(value = 2100, message = "Khóa học tối đa đến năm 2100")
    @Schema(description = "Năm nhập học / khóa học", example = "2024")
    Integer khoaHoc,

    @NotBlank(message = "Mã khoa không được để trống")
    @Size(max = 10, message = "Mã khoa tối đa 10 ký tự")
    @Schema(description = "Mã khoa quản lý lớp", example = "CNTT")
    String maKhoa,

    @Size(max = 10, message = "Mã giảng viên cố vấn tối đa 10 ký tự")
    @Schema(description = "Mã giảng viên cố vấn học tập (có thể để trống)", example = "GV01")
    String maGVCoVan
) {}
