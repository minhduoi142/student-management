package com.ocr.service.impl;

import com.ocr.exception.FileStorageException;
import com.ocr.exception.InvalidFileException;
import com.ocr.service.MinioService;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioServiceImpl implements MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name:qlsv-avatars}")
    private String bucketName;

    @Value("${minio.public-url:http://localhost:9000/qlsv-avatars}")
    private String publicUrl;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    @Override
    public String uploadAvatar(MultipartFile file, String prefix) {
        validateImageFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String cleanPrefix = (prefix != null && !prefix.isBlank()) ? prefix.replaceAll("[^a-zA-Z0-9_-]", "") : "user";
        String objectName = String.format("avatars/%s_%d_%s.%s", cleanPrefix, System.currentTimeMillis(), UUID.randomUUID().toString().substring(0, 8), extension);

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            log.info("Upload avatar thành công lên MinIO: bucket={}, object={}", bucketName, objectName);
            // Chuẩn hóa URL công khai
            String normalizedPublicUrl = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
            return normalizedPublicUrl + "/" + objectName;
        } catch (Exception e) {
            log.error("Lỗi khi upload tệp lên MinIO: {}", e.getMessage(), e);
            throw new FileStorageException("Không thể lưu trữ tệp tin trên MinIO: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String fileUrlOrKey) {
        if (fileUrlOrKey == null || fileUrlOrKey.isBlank()) {
            return;
        }

        String objectName = extractObjectName(fileUrlOrKey);
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            log.info("Đã xóa file cũ trên MinIO: bucket={}, object={}", bucketName, objectName);
        } catch (Exception e) {
            log.warn("Không thể xóa file '{}' trên MinIO: {}", objectName, e.getMessage());
            // Không throw exception để tránh gián đoạn flow nghiệp vụ chính
        }
    }

    @Override
    public InputStream getFileStream(String objectName) {
        if (objectName == null || objectName.isBlank()) {
            throw new InvalidFileException("Tên tệp không hợp lệ");
        }

        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
        } catch (Exception e) {
            log.error("Lỗi khi tải stream tệp '{}' từ MinIO: {}", objectName, e.getMessage());
            throw new FileStorageException("Không thể tìm thấy hoặc đọc tệp tin: " + objectName, e);
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Vui lòng chọn tệp tin ảnh để tải lên.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException("Kích thước tệp tin vượt quá giới hạn tối đa cho phép (5MB).");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new InvalidFileException("Định dạng tệp không được hỗ trợ. Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF.");
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "png";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private String extractObjectName(String fileUrlOrKey) {
        if (fileUrlOrKey.contains("/" + bucketName + "/")) {
            return fileUrlOrKey.substring(fileUrlOrKey.indexOf("/" + bucketName + "/") + bucketName.length() + 2);
        }
        if (fileUrlOrKey.startsWith("http://") || fileUrlOrKey.startsWith("https://")) {
            int lastSlash = fileUrlOrKey.lastIndexOf("/");
            int secondLastSlash = fileUrlOrKey.lastIndexOf("/", lastSlash - 1);
            if (secondLastSlash != -1) {
                return fileUrlOrKey.substring(secondLastSlash + 1);
            }
        }
        return fileUrlOrKey;
    }
}
