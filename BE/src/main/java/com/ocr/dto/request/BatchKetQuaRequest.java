package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Schema(description = "Yêu cầu nhập hoặc cập nhật điểm hàng loạt cho lớp học phần")
public record BatchKetQuaRequest(
    @NotBlank(message = "Mã môn học không được để trống")
    @Schema(description = "Mã môn học", example = "INT1313")
    String maMH,

    @NotBlank(message = "Mã lớp không được để trống")
    @Schema(description = "Mã lớp", example = "D24CQCE02-B")
    String maLop,

    @NotBlank(message = "Mã học kỳ không được để trống")
    @Schema(description = "Mã học kỳ", example = "2024-1")
    String maHK,

    @NotEmpty(message = "Danh sách điểm không được để trống")
    @Valid
    @Schema(description = "Danh sách các bản ghi điểm cần lưu")
    List<KetQuaRequest> danhSachDiem
) {}
