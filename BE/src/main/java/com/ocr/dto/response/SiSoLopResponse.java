package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thống kê sĩ số sinh viên theo từng lớp học (Câu 6)")
public record SiSoLopResponse(
    @Schema(description = "Mã lớp", example = "D24CQCE02-B")
    String maLop,

    @Schema(description = "Tên lớp", example = "Kỹ thuật Máy tính 02 - Khóa 2024")
    String tenLop,

    @Schema(description = "Tên khoa", example = "Công nghệ Thông tin 1")
    String tenKhoa,

    @Schema(description = "Sĩ số sinh viên hiện tại trong lớp", example = "35")
    long siSo
) {}
