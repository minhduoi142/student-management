package com.ocr.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho bảng KHOA
 */
@Entity
@Table(
    name = "KHOA",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_khoa_ten", columnNames = {"TenKhoa"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Khoa {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "MaKhoa", length = 10, nullable = false)
    @NotBlank(message = "Mã khoa không được để trống")
    @Size(max = 10, message = "Mã khoa tối đa 10 ký tự")
    private String maKhoa;

    @Column(name = "TenKhoa", length = 100, nullable = false, unique = true)
    @NotBlank(message = "Tên khoa không được để trống")
    @Size(max = 100, message = "Tên khoa tối đa 100 ký tự")
    private String tenKhoa;

    // Quan hệ 1 - N: Khoa 1 – N Giảng viên
    @OneToMany(mappedBy = "khoa", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<GiangVien> giangViens = new ArrayList<>();

    // Quan hệ 1 - N: Khoa 1 – N Lớp
    @OneToMany(mappedBy = "khoa", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<Lop> lops = new ArrayList<>();
}
