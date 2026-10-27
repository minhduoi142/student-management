package com.ocr.service;

import com.ocr.dto.response.AvatarUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface AvatarService {

    /**
     * Tự tải lên hoặc thay đổi ảnh đại diện của người dùng đang đăng nhập (ADMIN, GIANGVIEN, SINHVIEN)
     *
     * @param file Tệp ảnh tải lên
     * @return Thông tin chi tiết ảnh đại diện mới
     */
    AvatarUploadResponse uploadSelfAvatar(MultipartFile file);

    /**
     * Xóa ảnh đại diện của người dùng đang đăng nhập, quay về avatar chữ cái (Initials)
     */
    void deleteSelfAvatar();

    /**
     * Quản trị viên cập nhật ảnh thẻ đại diện cho một sinh viên cụ thể
     *
     * @param maSV Mã số sinh viên
     * @param file Tệp ảnh
     * @return Thông tin chi tiết ảnh đại diện mới
     */
    AvatarUploadResponse uploadStudentAvatar(String maSV, MultipartFile file);

    /**
     * Quản trị viên cập nhật ảnh đại diện cho một giảng viên cụ thể
     *
     * @param maGV Mã giảng viên
     * @param file Tệp ảnh
     * @return Thông tin chi tiết ảnh đại diện mới
     */
    AvatarUploadResponse uploadTeacherAvatar(String maGV, MultipartFile file);
}
