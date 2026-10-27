package com.ocr.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface MinioService {

    /**
     * Tải tệp ảnh đại diện lên MinIO và trả về URL truy cập công khai
     *
     * @param file   Tệp ảnh từ client (MultipartFile)
     * @param prefix Tiền tố phân loại (ví dụ: admin, gv_GV01, sv_B24DCCE001)
     * @return URL công khai của tệp vừa tải lên
     */
    String uploadAvatar(MultipartFile file, String prefix);

    /**
     * Xóa tệp khỏi MinIO dựa trên URL hoặc Object Key
     *
     * @param fileUrlOrKey URL hoặc tên object trên MinIO
     */
    void deleteFile(String fileUrlOrKey);

    /**
     * Đọc luồng nhị phân của tệp từ MinIO để phục vụ proxy streaming
     *
     * @param objectName Tên object trong bucket
     * @return InputStream luồng dữ liệu tệp
     */
    InputStream getFileStream(String objectName);
}
