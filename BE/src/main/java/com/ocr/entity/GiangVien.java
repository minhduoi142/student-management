package com.ocr.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho bảng GIANGVIEN
 */
@Entity
@Table(
    name = "GIANGVIEN",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_giangvien_email", columnNames = {"Email"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class GiangVien {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "MaGV", length = 10, nullable = false)
    @NotBlank(message = "Mã giảng viên không được để trống")
    @Size(max = 10, message = "Mã giảng viên tối đa 10 ký tự")
    private String maGV;

    @Column(name = "HoTen", length = 100, nullable = false)
    @NotBlank(message = "Họ tên giảng viên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String hoTen;

    @Column(name = "Email", length = 100, unique = true)
    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    private String email;

    @Column(name = "SoDienThoai", length = 15)
    @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự")
    private String soDienThoai;

    @Column(name = "AvatarUrl", length = 500)
    private String avatarUrl;


    // Quan hệ N - 1: Giảng viên thuộc 1 Khoa (bắt buộc)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaKhoa",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_giangvien_khoa")
    )
    @ToString.Exclude
    private Khoa khoa;

    // Quan hệ 1 - N: Giảng viên làm Cố vấn học tập cho nhiều Lớp (không bắt buộc)
    @OneToMany(mappedBy = "coVanHocTap", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<Lop> lopsCoVan = new ArrayList<>();
}
