package com.ocr.dto.response;

import com.ocr.entity.enums.RoleEnum;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Thông tin phản hồi đăng nhập thành công")
public record LoginResponse(
    @Schema(description = "JWT Access Token dùng cho các API yêu cầu xác thực", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    String accessToken,

    @Schema(description = "Loại token", example = "Bearer")
    String tokenType,

    @Schema(description = "Tên đăng nhập", example = "admin")
    String username,

    @Schema(description = "Vai trò của tài khoản trong hệ thống", example = "ADMIN")
    RoleEnum role,

    @Schema(description = "Mã sinh viên liên kết (nếu có)", example = "B24DCCE001")
    String maSV,

    @Schema(description = "Mã giảng viên liên kết (nếu có)", example = "GV01")
    String maGV,

    @Schema(description = "Đường dẫn ảnh đại diện (nếu có)", example = "http://localhost:9000/qlsv-avatars/avatars/admin_xxx.png")
    String avatarUrl
) {
    public LoginResponse(String accessToken, String username, RoleEnum role, String maSV, String maGV) {
        this(accessToken, "Bearer", username, role, maSV, maGV, null);
    }

    public LoginResponse(String accessToken, String username, RoleEnum role, String maSV, String maGV, String avatarUrl) {
        this(accessToken, "Bearer", username, role, maSV, maGV, avatarUrl);
    }
}
