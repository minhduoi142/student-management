package com.ocr.entity;

import com.ocr.entity.enums.RoleEnum;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entity đại diện cho bảng TAIKHOAN (Người dùng và phân quyền hệ thống)
 */
@Entity
@Table(
    name = "TAIKHOAN",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_username", columnNames = {"Username"}),
        @UniqueConstraint(name = "uq_user_sv", columnNames = {"MaSV"}),
        @UniqueConstraint(name = "uq_user_gv", columnNames = {"MaGV"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TaiKhoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "Id")
    private Long id;

    @Column(name = "Username", length = 50, nullable = false, unique = true)
    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Size(max = 50, message = "Tên đăng nhập tối đa 50 ký tự")
    private String username;

    @Column(name = "Password", length = 255, nullable = false)
    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(max = 255, message = "Mật khẩu tối đa 255 ký tự")
    @ToString.Exclude
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", length = 20, nullable = false)
    @NotNull(message = "Vai trò người dùng không được để trống")
    private RoleEnum role;

    // Quan hệ 1 - 1: Tài khoản liên kết với Sinh viên (nếu role là SINHVIEN)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "MaSV",
        referencedColumnName = "MaSV",
        foreignKey = @ForeignKey(name = "fk_user_sv")
    )
    @ToString.Exclude
    private SinhVien sinhVien;

    // Quan hệ 1 - 1: Tài khoản liên kết với Giảng viên (nếu role là GIANGVIEN)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "MaGV",
        referencedColumnName = "MaGV",
        foreignKey = @ForeignKey(name = "fk_user_gv")
    )
    @ToString.Exclude
    private GiangVien giangVien;

    @Column(name = "TrangThai", nullable = false)
    @Builder.Default
    private Boolean trangThai = true;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (trangThai == null) {
            trangThai = true;
        }
    }
}
