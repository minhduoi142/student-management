package com.ocr.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class MinioConfig {

    @Value("${minio.endpoint:http://localhost:9000}")
    private String endpoint;

    @Value("${minio.access-key:minioadmin}")
    private String accessKey;

    @Value("${minio.secret-key:minioadmin}")
    private String secretKey;

    @Value("${minio.bucket-name:qlsv-avatars}")
    private String bucketName;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    }

    /**
     * Tự động kiểm tra và khởi tạo Bucket MinIO với Public-Read policy khi ứng dụng khởi động
     */
    @Bean
    public ApplicationRunner initializeMinioBucket(MinioClient minioClient) {
        return args -> {
            try {
                boolean bucketExists = minioClient.bucketExists(
                        BucketExistsArgs.builder().bucket(bucketName).build()
                );

                if (!bucketExists) {
                    log.info("Bucket '{}' chưa tồn tại trên MinIO. Đang tiến hành tạo mới...", bucketName);
                    minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                    log.info("Đã tạo thành công bucket '{}'.", bucketName);
                }

                // Cấu hình Bucket Policy: Cho phép mọi người đọc công khai (Public Read) các tệp trong bucket
                String publicReadPolicy = """
                        {
                            "Version": "2012-10-17",
                            "Statement": [
                                {
                                    "Effect": "Allow",
                                    "Principal": {"AWS": ["*"]},
                                    "Action": ["s3:GetObject"],
                                    "Resource": ["arn:aws:s3:::%s/*"]
                                }
                            ]
                        }
                        """.formatted(bucketName);

                minioClient.setBucketPolicy(
                        SetBucketPolicyArgs.builder()
                                .bucket(bucketName)
                                .config(publicReadPolicy)
                                .build()
                );
                log.info("Đã thiết lập chính sách Public-Read cho bucket '{}'.", bucketName);
            } catch (Exception e) {
                log.warn("Không thể tự động kết nối hoặc cấu hình MinIO bucket '{}' lúc khởi động: {}. Sẽ kiểm tra lại khi có request.", bucketName, e.getMessage());
            }
        };
    }
}
