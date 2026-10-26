package com.ocr.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

@Schema(description = "Đối tượng bao bọc kết quả phân trang")
public record PageResponse<T>(
    @Schema(description = "Danh sách dữ liệu trong trang hiện tại")
    List<T> content,

    @Schema(description = "Số trang hiện tại (0-indexed)", example = "0")
    int pageNo,

    @Schema(description = "Số bản ghi trên mỗi trang", example = "10")
    int pageSize,

    @Schema(description = "Tổng số bản ghi thỏa mãn điều kiện", example = "50")
    long totalElements,

    @Schema(description = "Tổng số trang", example = "5")
    int totalPages,

    @Schema(description = "Có phải trang cuối cùng hay không", example = "false")
    boolean last
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isLast()
        );
    }
}
