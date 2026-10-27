package com.ocr.service;

import com.ocr.dto.response.AvatarUploadResponse;
import com.ocr.entity.SinhVien;
import com.ocr.entity.TaiKhoan;
import com.ocr.entity.enums.RoleEnum;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.repository.TaiKhoanRepository;
import com.ocr.service.impl.AvatarServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AvatarServiceTest {

    @Mock
    private MinioService minioService;

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @Mock
    private SinhVienRepository sinhVienRepository;

    @Mock
    private GiangVienRepository giangVienRepository;

    @InjectMocks
    private AvatarServiceImpl avatarService;

    private TaiKhoan adminAccount;
    private TaiKhoan studentAccount;
    private SinhVien sinhVien;

    @BeforeEach
    void setUp() {
        adminAccount = TaiKhoan.builder()
                .id(1L)
                .username("admin")
                .role(RoleEnum.ADMIN)
                .avatarUrl("http://localhost:9000/qlsv-avatars/avatars/old_admin.png")
                .build();

        sinhVien = SinhVien.builder()
                .maSV("B24DCCE001")
                .hoTen("Nguyen Van A")
                .avatarUrl("http://localhost:9000/qlsv-avatars/avatars/old_sv.png")
                .build();

        studentAccount = TaiKhoan.builder()
                .id(2L)
                .username("b24dcce001")
                .role(RoleEnum.SINHVIEN)
                .sinhVien(sinhVien)
                .avatarUrl("http://localhost:9000/qlsv-avatars/avatars/old_sv.png")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Admin tự upload avatar cá nhân thành công")
    void uploadSelfAvatar_adminSuccess() {
        // Arrange
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", "admin123", Collections.emptyList())
        );

        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.png", "image/png", new byte[]{1, 2, 3, 4}
        );

        String newUrl = "http://localhost:9000/qlsv-avatars/avatars/admin_new.png";
        when(taiKhoanRepository.findByUsername("admin")).thenReturn(Optional.of(adminAccount));
        when(minioService.uploadAvatar(any(), eq("admin_admin"))).thenReturn(newUrl);

        // Act
        AvatarUploadResponse response = avatarService.uploadSelfAvatar(file);

        // Assert
        assertNotNull(response);
        assertEquals(newUrl, response.avatarUrl());
        assertEquals(newUrl, adminAccount.getAvatarUrl());
        verify(taiKhoanRepository).save(adminAccount);
        verify(minioService).deleteFile("http://localhost:9000/qlsv-avatars/avatars/old_admin.png");
    }

    @Test
    @DisplayName("Sinh viên tự upload avatar cá nhân và đồng bộ cả TAIKHOAN và SINHVIEN")
    void uploadSelfAvatar_studentSuccess() {
        // Arrange
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("b24dcce001", "123456", Collections.emptyList())
        );

        MockMultipartFile file = new MockMultipartFile(
                "file", "student.jpg", "image/jpeg", new byte[]{10, 20, 30}
        );

        String newUrl = "http://localhost:9000/qlsv-avatars/avatars/sv_B24DCCE001_new.jpg";
        when(taiKhoanRepository.findByUsername("b24dcce001")).thenReturn(Optional.of(studentAccount));
        when(minioService.uploadAvatar(any(), eq("sv_B24DCCE001"))).thenReturn(newUrl);

        // Act
        AvatarUploadResponse response = avatarService.uploadSelfAvatar(file);

        // Assert
        assertNotNull(response);
        assertEquals(newUrl, response.avatarUrl());
        assertEquals(newUrl, studentAccount.getAvatarUrl());
        assertEquals(newUrl, sinhVien.getAvatarUrl());
        verify(taiKhoanRepository).save(studentAccount);
        verify(sinhVienRepository).save(sinhVien);
        verify(minioService).deleteFile("http://localhost:9000/qlsv-avatars/avatars/old_sv.png");
    }

    @Test
    @DisplayName("Quản trị viên cập nhật ảnh thẻ cho sinh viên theo mã SV")
    void uploadStudentAvatar_adminSuccess() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
                "file", "card.png", "image/png", new byte[]{5, 6, 7}
        );

        String newUrl = "http://localhost:9000/qlsv-avatars/avatars/sv_B24DCCE001_card.png";
        when(sinhVienRepository.findById("B24DCCE001")).thenReturn(Optional.of(sinhVien));
        when(minioService.uploadAvatar(any(), eq("sv_B24DCCE001"))).thenReturn(newUrl);
        when(taiKhoanRepository.findBySinhVien_MaSV("B24DCCE001")).thenReturn(Optional.of(studentAccount));

        // Act
        AvatarUploadResponse response = avatarService.uploadStudentAvatar("B24DCCE001", file);

        // Assert
        assertNotNull(response);
        assertEquals(newUrl, response.avatarUrl());
        assertEquals(newUrl, sinhVien.getAvatarUrl());
        assertEquals(newUrl, studentAccount.getAvatarUrl());
        verify(sinhVienRepository).save(sinhVien);
        verify(taiKhoanRepository).save(studentAccount);
    }

    @Test
    @DisplayName("Xóa ảnh đại diện cá nhân đưa về null")
    void deleteSelfAvatar_success() {
        // Arrange
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", "admin123", Collections.emptyList())
        );
        when(taiKhoanRepository.findByUsername("admin")).thenReturn(Optional.of(adminAccount));

        // Act
        avatarService.deleteSelfAvatar();

        // Assert
        assertNull(adminAccount.getAvatarUrl());
        verify(minioService).deleteFile("http://localhost:9000/qlsv-avatars/avatars/old_admin.png");
        verify(taiKhoanRepository).save(adminAccount);
    }
}
