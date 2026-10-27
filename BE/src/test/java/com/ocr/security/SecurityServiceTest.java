package com.ocr.security;

import com.ocr.entity.GiangVien;
import com.ocr.entity.SinhVien;
import com.ocr.entity.TaiKhoan;
import com.ocr.entity.enums.RoleEnum;
import com.ocr.repository.PhanCongRepository;
import com.ocr.repository.TaiKhoanRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SecurityServiceTest {

    @Mock
    private PhanCongRepository phanCongRepository;

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @InjectMocks
    private SecurityService securityService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("canTeacherGrade: Trả về true nếu người dùng là ADMIN")
    void testCanTeacherGrade_Admin() {
        TaiKhoan admin = TaiKhoan.builder()
                .username("admin")
                .role(RoleEnum.ADMIN)
                .build();

        when(taiKhoanRepository.findByUsername("admin")).thenReturn(Optional.of(admin));

        boolean result = securityService.canTeacherGrade("admin", "INT1313", "D24CQCE02-B", "2024-1");
        assertTrue(result);
    }

    @Test
    @DisplayName("canTeacherGrade: Trả về true nếu Giảng viên được phân công giảng dạy môn, lớp, kỳ đó")
    void testCanTeacherGrade_Assigned() {
        GiangVien gv = GiangVien.builder().maGV("GV01").build();
        TaiKhoan tkGv = TaiKhoan.builder()
                .username("gv01")
                .role(RoleEnum.GIANGVIEN)
                .giangVien(gv)
                .build();

        when(taiKhoanRepository.findByUsername("gv01")).thenReturn(Optional.of(tkGv));
        when(phanCongRepository.existsByGiangVien_MaGVAndMonHoc_MaMHAndLop_MaLopAndHocKy_MaHK("GV01", "INT1313", "D24CQCE02-B", "2024-1"))
                .thenReturn(true);

        boolean result = securityService.canTeacherGrade("gv01", "INT1313", "D24CQCE02-B", "2024-1");
        assertTrue(result);
    }

    @Test
    @DisplayName("canTeacherGrade: Trả về false nếu Giảng viên không được phân công")
    void testCanTeacherGrade_NotAssigned() {
        GiangVien gv = GiangVien.builder().maGV("GV02").build();
        TaiKhoan tkGv = TaiKhoan.builder()
                .username("gv02")
                .role(RoleEnum.GIANGVIEN)
                .giangVien(gv)
                .build();

        when(taiKhoanRepository.findByUsername("gv02")).thenReturn(Optional.of(tkGv));
        when(phanCongRepository.existsByGiangVien_MaGVAndMonHoc_MaMHAndLop_MaLopAndHocKy_MaHK("GV02", "INT1313", "D24CQCE02-B", "2024-1"))
                .thenReturn(false);

        boolean result = securityService.canTeacherGrade("gv02", "INT1313", "D24CQCE02-B", "2024-1");
        assertFalse(result);
    }

    @Test
    @DisplayName("isStudentOwner: Sinh viên xem đúng mã SV của mình -> true")
    void testIsStudentOwner_Matching() {
        CustomUserDetails userDetails = CustomUserDetails.builder()
                .id(10L)
                .username("b24dcce001")
                .role(RoleEnum.SINHVIEN)
                .maSV("B24DCCE001")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_SINHVIEN")))
                .build();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        boolean result = securityService.isStudentOwner("B24DCCE001");
        assertTrue(result);
    }

    @Test
    @DisplayName("isStudentOwner: Sinh viên tra cứu mã SV của sinh viên khác -> false")
    void testIsStudentOwner_DifferentStudent() {
        CustomUserDetails userDetails = CustomUserDetails.builder()
                .id(10L)
                .username("b24dcce001")
                .role(RoleEnum.SINHVIEN)
                .maSV("B24DCCE001")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_SINHVIEN")))
                .build();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        boolean result = securityService.isStudentOwner("B24DCCE999");
        assertFalse(result);
    }

    @Test
    @DisplayName("isStudentOwner: ADMIN hoặc GIANGVIEN tra cứu điểm sinh viên bất kỳ -> true")
    void testIsStudentOwner_AdminOrTeacher() {
        CustomUserDetails adminDetails = CustomUserDetails.builder()
                .id(1L)
                .username("admin")
                .role(RoleEnum.ADMIN)
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .build();

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(adminDetails, null, adminDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);

        boolean result = securityService.isStudentOwner("B24DCCE001");
        assertTrue(result);
    }
}
