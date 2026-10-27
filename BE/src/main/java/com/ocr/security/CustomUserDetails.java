package com.ocr.security;

import com.ocr.entity.TaiKhoan;
import com.ocr.entity.enums.RoleEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Getter
@AllArgsConstructor
@Builder
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final RoleEnum role;
    private final String maSV;
    private final String maGV;
    private final Boolean trangThai;
    private final Collection<? extends GrantedAuthority> authorities;

    public static CustomUserDetails fromEntity(TaiKhoan taiKhoan) {
        List<GrantedAuthority> auths = new ArrayList<>();
        if (taiKhoan.getRole() != null) {
            auths.add(new SimpleGrantedAuthority("ROLE_" + taiKhoan.getRole().name()));
            auths.add(new SimpleGrantedAuthority(taiKhoan.getRole().name()));
        }

        String maSV = (taiKhoan.getSinhVien() != null) ? taiKhoan.getSinhVien().getMaSV() : null;
        String maGV = (taiKhoan.getGiangVien() != null) ? taiKhoan.getGiangVien().getMaGV() : null;

        return CustomUserDetails.builder()
                .id(taiKhoan.getId())
                .username(taiKhoan.getUsername())
                .password(taiKhoan.getPassword())
                .role(taiKhoan.getRole())
                .maSV(maSV)
                .maGV(maGV)
                .trangThai(taiKhoan.getTrangThai())
                .authorities(auths)
                .build();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return Boolean.TRUE.equals(trangThai);
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return Boolean.TRUE.equals(trangThai);
    }
}
