package com.ocr.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Thông tin phản hồi sau khi upload hoặc cập nhật ảnh đại diện thành công")
public record AvatarUploadResponse(
    @Schema(description = "Đường dẫn URL công khai của ảnh đại diện", example = "http://localhost:9000/qlsv-avatars/avatars/admin_1730000000_a1b2c3d4.png")
    String avatarUrl,

    @Schema(description = "Tên tệp tin được lưu trên storage", example = "avatars/admin_1730000000_a1b2c3d4.png")
    String fileName,

    @Schema(description = "Kích thước tệp (bytes)", example = "204850")
    long size,

    @Schema(description = "Thời điểm tải lên", example = "2026-10-27 14:30:00")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime uploadedAt
) {}
