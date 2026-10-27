package com.ocr.security;

import com.ocr.entity.enums.RoleEnum;
import com.ocr.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "9a4f2c8d3e71b5a6c4d8e2f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 3600000L);
    }

    @Test
    @DisplayName("Sinh và parse token cho ADMIN thành công")
    void testGenerateAndValidateToken_Admin() {
        CustomUserDetails userDetails = CustomUserDetails.builder()
                .id(1L)
                .username("admin")
                .password("encoded_pass")
                .role(RoleEnum.ADMIN)
                .trangThai(true)
                .authorities(Collections.emptyList())
                .build();

        String token = jwtTokenProvider.generateTokenFromUserDetails(userDetails);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("admin", jwtTokenProvider.getUsernameFromToken(token));
        assertEquals("ADMIN", jwtTokenProvider.getRoleFromToken(token));
        assertNull(jwtTokenProvider.getMaSVFromToken(token));
        assertNull(jwtTokenProvider.getMaGVFromToken(token));
    }

    @Test
    @DisplayName("Sinh và parse token cho GIANGVIEN thành công")
    void testGenerateAndValidateToken_GiangVien() {
        CustomUserDetails userDetails = CustomUserDetails.builder()
                .id(2L)
                .username("gv01")
                .password("encoded_pass")
                .role(RoleEnum.GIANGVIEN)
                .maGV("GV01")
                .trangThai(true)
                .authorities(Collections.emptyList())
                .build();

        String token = jwtTokenProvider.generateTokenFromUserDetails(userDetails);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("gv01", jwtTokenProvider.getUsernameFromToken(token));
        assertEquals("GIANGVIEN", jwtTokenProvider.getRoleFromToken(token));
        assertEquals("GV01", jwtTokenProvider.getMaGVFromToken(token));
        assertNull(jwtTokenProvider.getMaSVFromToken(token));
    }

    @Test
    @DisplayName("Sinh và parse token cho SINHVIEN thành công")
    void testGenerateAndValidateToken_SinhVien() {
        CustomUserDetails userDetails = CustomUserDetails.builder()
                .id(3L)
                .username("b24dcce001")
                .password("encoded_pass")
                .role(RoleEnum.SINHVIEN)
                .maSV("B24DCCE001")
                .trangThai(true)
                .authorities(Collections.emptyList())
                .build();

        String token = jwtTokenProvider.generateTokenFromUserDetails(userDetails);

        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("b24dcce001", jwtTokenProvider.getUsernameFromToken(token));
        assertEquals("SINHVIEN", jwtTokenProvider.getRoleFromToken(token));
        assertEquals("B24DCCE001", jwtTokenProvider.getMaSVFromToken(token));
        assertNull(jwtTokenProvider.getMaGVFromToken(token));
    }

    @Test
    @DisplayName("Kiểm tra token không hợp lệ trả về false")
    void testValidateInvalidToken() {
        assertFalse(jwtTokenProvider.validateToken("invalid.token.here"));
        assertFalse(jwtTokenProvider.validateToken(""));
    }
}
