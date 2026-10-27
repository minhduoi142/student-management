package com.ocr.security;

import com.ocr.entity.GiangVien;
import com.ocr.entity.SinhVien;
import com.ocr.entity.TaiKhoan;
import com.ocr.entity.enums.RoleEnum;
import com.ocr.repository.TaiKhoanRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private TaiKhoanRepository taiKhoanRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    @DisplayName("Load thành công tài khoản giảng viên")
    void testLoadUserByUsername_Success() {
        GiangVien gv = GiangVien.builder().maGV("GV01").hoTen("TS. Trần Văn An").build();
        TaiKhoan tk = TaiKhoan.builder()
                .id(1L)
                .username("gv01")
                .password("encoded_pass")
                .role(RoleEnum.GIANGVIEN)
                .giangVien(gv)
                .trangThai(true)
                .build();

        when(taiKhoanRepository.findByUsername("gv01")).thenReturn(Optional.of(tk));

        UserDetails userDetails = userDetailsService.loadUserByUsername("gv01");

        assertNotNull(userDetails);
        assertEquals("gv01", userDetails.getUsername());
        assertTrue(userDetails.isEnabled());
        assertTrue(userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_GIANGVIEN")));
    }

    @Test
    @DisplayName("Ném UsernameNotFoundException khi tài khoản không tồn tại")
    void testLoadUserByUsername_NotFound() {
        when(taiKhoanRepository.findByUsername("unknown")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userDetailsService.loadUserByUsername("unknown"));
    }

    @Test
    @DisplayName("Ném DisabledException khi tài khoản bị khóa (trangThai = false)")
    void testLoadUserByUsername_Disabled() {
        TaiKhoan tk = TaiKhoan.builder()
                .id(2L)
                .username("locked_user")
                .password("encoded_pass")
                .role(RoleEnum.SINHVIEN)
                .trangThai(false)
                .build();

        when(taiKhoanRepository.findByUsername("locked_user")).thenReturn(Optional.of(tk));

        assertThrows(DisabledException.class, () -> userDetailsService.loadUserByUsername("locked_user"));
    }
}
