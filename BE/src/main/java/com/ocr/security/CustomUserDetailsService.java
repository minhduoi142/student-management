package com.ocr.security;

import com.ocr.entity.TaiKhoan;
import com.ocr.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        TaiKhoan taiKhoan = taiKhoanRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với tên đăng nhập: " + username));

        if (Boolean.FALSE.equals(taiKhoan.getTrangThai())) {
            throw new DisabledException("Tài khoản '" + username + "' đã bị khóa hoặc ngừng hoạt động.");
        }

        return CustomUserDetails.fromEntity(taiKhoan);
    }
}
