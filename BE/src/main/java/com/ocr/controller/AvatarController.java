package com.ocr.controller;

import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.AvatarUploadResponse;
import com.ocr.service.AvatarService;
import com.ocr.service.MinioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@RestController
@RequiredArgsConstructor
@Tag(name = "Quản lý Ảnh đại diện (Avatar Storage)", description = "Các API lưu trữ tệp tin trên MinIO: Upload, xóa và thay đổi avatar cho Admin, Giảng viên và Sinh viên")
public class AvatarController {

    private final AvatarService avatarService;
    private final MinioService minioService;

    @PostMapping(value = "/api/v1/users/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Tải lên hoặc thay đổi ảnh đại diện cá nhân",
            description = "Cho phép người dùng đang đăng nhập (ADMIN, GIANGVIEN, SINHVIEN) upload hoặc cập nhật ảnh đại diện lên MinIO"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Cập nhật ảnh đại diện thành công",
                    content = @Content(schema = @Schema(implementation = AvatarUploadResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Tệp tin rỗng, kích thước vượt quá 5MB hoặc sai định dạng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Lỗi lưu trữ tệp trên MinIO")
    })
    public ResponseEntity<ApiResponse<AvatarUploadResponse>> uploadSelfAvatar(
            @Parameter(description = "Tệp ảnh (JPG, PNG, WEBP, GIF, tối đa 5MB)", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        AvatarUploadResponse response = avatarService.uploadSelfAvatar(file);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật ảnh đại diện thành công"));
    }

    @DeleteMapping("/api/v1/users/avatar")
    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Xóa ảnh đại diện cá nhân",
            description = "Xóa tệp ảnh đại diện khỏi MinIO và đưa tài khoản về avatar mặc định (chữ cái đầu)"
    )
    public ResponseEntity<ApiResponse<Void>> deleteSelfAvatar() {
        avatarService.deleteSelfAvatar();
        return ResponseEntity.ok(ApiResponse.success(null, "Đã xóa ảnh đại diện thành công"));
    }

    @PostMapping(value = "/api/v1/sinh-vien/{maSV}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Quản trị viên tải lên/thay đổi ảnh thẻ cho sinh viên",
            description = "Dành riêng cho Quản trị viên cập nhật ảnh thẻ cho hồ sơ sinh viên từ trang Quản trị"
    )
    public ResponseEntity<ApiResponse<AvatarUploadResponse>> uploadStudentAvatar(
            @Parameter(description = "Mã số sinh viên", example = "B24DCCE001", required = true)
            @PathVariable String maSV,
            @Parameter(description = "Tệp ảnh thẻ", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        AvatarUploadResponse response = avatarService.uploadStudentAvatar(maSV, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật ảnh thẻ sinh viên thành công"));
    }

    @PostMapping(value = "/api/v1/giang-vien/{maGV}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Quản trị viên tải lên/thay đổi ảnh đại diện cho giảng viên",
            description = "Dành riêng cho Quản trị viên cập nhật ảnh hồ sơ cho cán bộ giảng dạy"
    )
    public ResponseEntity<ApiResponse<AvatarUploadResponse>> uploadTeacherAvatar(
            @Parameter(description = "Mã giảng viên", example = "GV01", required = true)
            @PathVariable String maGV,
            @Parameter(description = "Tệp ảnh giảng viên", required = true)
            @RequestParam("file") MultipartFile file
    ) {
        AvatarUploadResponse response = avatarService.uploadTeacherAvatar(maGV, file);
        return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật ảnh giảng viên thành công"));
    }

    @GetMapping("/api/v1/files/avatar/{fileName}")
    @Operation(
            summary = "Đọc và stream tệp tin ảnh đại diện từ MinIO (Public Endpoint)",
            description = "Endpoint công khai cho phép trình duyệt tải trực tiếp ảnh đại diện từ backend nếu không truy cập trực tiếp qua cổng MinIO"
    )
    public ResponseEntity<Resource> streamAvatar(
            @Parameter(description = "Tên tệp tin ảnh", example = "admin_1730000000_a1b2c3d4.png", required = true)
            @PathVariable String fileName
    ) {
        String objectName = "avatars/" + fileName;
        InputStream inputStream = minioService.getFileStream(objectName);
        InputStreamResource resource = new InputStreamResource(inputStream);

        MediaType mediaType = MediaType.IMAGE_PNG;
        String lowerName = fileName.toLowerCase();
        if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
            mediaType = MediaType.IMAGE_JPEG;
        } else if (lowerName.endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else if (lowerName.endsWith(".gif")) {
            mediaType = MediaType.IMAGE_GIF;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
