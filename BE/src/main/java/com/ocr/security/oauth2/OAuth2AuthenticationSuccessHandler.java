package com.ocr.security.oauth2;

import com.ocr.entity.GiangVien;
import com.ocr.entity.SinhVien;
import com.ocr.entity.TaiKhoan;
import com.ocr.entity.enums.RoleEnum;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.repository.TaiKhoanRepository;
import com.ocr.security.CustomUserDetails;
import com.ocr.security.jwt.JwtTokenProvider;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final PasswordEncoder passwordEncoder;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${app.oauth2.authorized-redirect-uri:http://localhost:3000/oauth2/redirect}")
    private String defaultRedirectUri;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            log.debug("Response đã được gửi trước đó, không thể redirect tới {}", targetUrl);
            return;
        }

        clearAuthenticationAttributes(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        String redirectUriCookie = CookieUtils.getCookie(request, HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME)
                .map(Cookie::getValue)
                .orElse(null);

        String targetBaseUrl = (redirectUriCookie != null && !redirectUriCookie.isBlank())
                ? redirectUriCookie
                : defaultRedirectUri;

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        if (email == null || email.isBlank()) {
            email = oAuth2User.getName();
        }

        log.info("Xử lý đăng nhập OAuth2 thành công với email: {}", email);

        // 1. Tìm hoặc tạo tài khoản hệ thống tương ứng với email Google
        TaiKhoan taiKhoan = resolveAccount(email);

        // 2. Kiểm tra trạng thái tài khoản
        if (!Boolean.TRUE.equals(taiKhoan.getTrangThai())) {
            log.warn("Tài khoản {} đã bị khóa khi cố gắng đăng nhập qua Google OAuth2", email);
            return UriComponentsBuilder.fromUriString(targetBaseUrl)
                    .queryParam("error", "ACCOUNT_LOCKED")
                    .queryParam("message", "Tài khoản của bạn đã bị khóa hoặc vô hiệu hóa.")
                    .build().toUriString();
        }

        // 3. Sinh JWT Token từ CustomUserDetails
        CustomUserDetails userDetails = CustomUserDetails.fromEntity(taiKhoan);
        String token = jwtTokenProvider.generateTokenFromUserDetails(userDetails);

        // 4. Redirect về Frontend kèm JWT và thông tin tài khoản
        return UriComponentsBuilder.fromUriString(targetBaseUrl)
                .queryParam("token", token)
                .queryParam("username", taiKhoan.getUsername())
                .queryParam("role", taiKhoan.getRole().name())
                .queryParam("maSV", userDetails.getMaSV() != null ? userDetails.getMaSV() : "")
                .queryParam("maGV", userDetails.getMaGV() != null ? userDetails.getMaGV() : "")
                .build().toUriString();
    }

    private TaiKhoan resolveAccount(String email) {
        // Kiểm tra xem đã có tài khoản với Username = email chưa
        Optional<TaiKhoan> existingTk = taiKhoanRepository.findByUsername(email);
        if (existingTk.isPresent()) {
            return existingTk.get();
        }

        // Kiểm tra email trong bảng SinhVien
        Optional<SinhVien> svOpt = sinhVienRepository.findByEmail(email);
        if (svOpt.isPresent()) {
            SinhVien sv = svOpt.get();
            Optional<TaiKhoan> svTk = taiKhoanRepository.findBySinhVien_MaSV(sv.getMaSV());
            if (svTk.isPresent()) {
                return svTk.get();
            }

            TaiKhoan newTk = TaiKhoan.builder()
                    .username(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(RoleEnum.SINHVIEN)
                    .sinhVien(sv)
                    .trangThai(true)
                    .build();
            return taiKhoanRepository.save(newTk);
        }

        // Kiểm tra email trong bảng GiangVien
        Optional<GiangVien> gvOpt = giangVienRepository.findByEmail(email);
        if (gvOpt.isPresent()) {
            GiangVien gv = gvOpt.get();
            Optional<TaiKhoan> gvTk = taiKhoanRepository.findByGiangVien_MaGV(gv.getMaGV());
            if (gvTk.isPresent()) {
                return gvTk.get();
            }

            TaiKhoan newTk = TaiKhoan.builder()
                    .username(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(RoleEnum.GIANGVIEN)
                    .giangVien(gv)
                    .trangThai(true)
                    .build();
            return taiKhoanRepository.save(newTk);
        }

        // Nếu email chưa có trong SinhVien / GiangVien, tự động tạo tài khoản vai trò SINHVIEN mặc định
        TaiKhoan defaultTk = TaiKhoan.builder()
                .username(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(RoleEnum.SINHVIEN)
                .trangThai(true)
                .build();
        return taiKhoanRepository.save(defaultTk);
    }

    protected void clearAuthenticationAttributes(HttpServletRequest request, HttpServletResponse response) {
        super.clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
    }
}

