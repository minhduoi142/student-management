package com.ocr.service.impl;

import com.ocr.dto.request.LoginRequest;
import com.ocr.dto.response.LoginResponse;
import com.ocr.security.CustomUserDetails;
import com.ocr.security.jwt.JwtTokenProvider;
import com.ocr.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username().trim(),
                        request.password()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = tokenProvider.generateTokenFromUserDetails(userDetails);

        log.info("Người dùng '{}' đăng nhập thành công với vai trò: {}", userDetails.getUsername(), userDetails.getRole());

        return new LoginResponse(
                token,
                "Bearer",
                userDetails.getUsername(),
                userDetails.getRole(),
                userDetails.getMaSV(),
                userDetails.getMaGV()
        );
    }
}
