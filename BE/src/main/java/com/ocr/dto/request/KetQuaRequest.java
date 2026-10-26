package com.ocr.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Schema(description = "Yêu cầu nhập hoặc cập nhật điểm học phần cho Sinh viên (Câu 12, 14)")
public record KetQuaRequest(
    @NotBlank(message = "Mã sinh viên không được để trống")
    @Size(max = 15, message = "Mã sinh viên tối đa 15 ký tự")
    @Schema(description = "Mã sinh viên", example = "B24DCCE001")
    String maSV,

    @NotBlank(message = "Mã môn học không được để trống")
    @Size(max = 15, message = "Mã môn học tối đa 15 ký tự")
    @Schema(description = "Mã môn học", example = "INT1313")
    String maMH,

    @NotBlank(message = "Mã học kỳ không được để trống")
    @Size(max = 10, message = "Mã học kỳ tối đa 10 ký tự")
    @Schema(description = "Mã học kỳ", example = "2024-1")
    String maHK,

    @DecimalMin(value = "0.00", message = "Điểm chuyên cần phải từ 0.00 trở lên")
    @DecimalMax(value = "10.00", message = "Điểm chuyên cần tối đa là 10.00")
    @Digits(integer = 2, fraction = 2, message = "Điểm chuyên cần tối đa 2 chữ số nguyên và 2 chữ số thập phân")
    @Schema(description = "Điểm chuyên cần (10%)", example = "9.00")
    BigDecimal diemCC,

    @DecimalMin(value = "0.00", message = "Điểm giữa kỳ phải từ 0.00 trở lên")
    @DecimalMax(value = "10.00", message = "Điểm giữa kỳ tối đa là 10.00")
    @Digits(integer = 2, fraction = 2, message = "Điểm giữa kỳ tối đa 2 chữ số nguyên và 2 chữ số thập phân")
    @Schema(description = "Điểm giữa kỳ (30%)", example = "8.50")
    BigDecimal diemGK,

    @DecimalMin(value = "0.00", message = "Điểm cuối kỳ phải từ 0.00 trở lên")
    @DecimalMax(value = "10.00", message = "Điểm cuối kỳ tối đa là 10.00")
    @Digits(integer = 2, fraction = 2, message = "Điểm cuối kỳ tối đa 2 chữ số nguyên và 2 chữ số thập phân")
    @Schema(description = "Điểm cuối kỳ (60%)", example = "9.00")
    BigDecimal diemCK
) {}
