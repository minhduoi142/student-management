package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thống kê số lượng bản ghi kết quả theo từng học kỳ (Câu 10)")
public record ThongKeHocKyResponse(
    @Schema(description = "Mã học kỳ", example = "2024-1")
    String maHK,

    @Schema(description = "Năm học", example = "2024-2025")
    String namHoc,

    @Schema(description = "Kỳ học", example = "1")
    Integer ky,

    @Schema(description = "Tên học kỳ", example = "Học kỳ 1 - Năm học 2024-2025")
    String tenHocKy,

    @Schema(description = "Số lượng bản ghi điểm đã nhập", example = "125")
    long soLuongKetQua
) {}
