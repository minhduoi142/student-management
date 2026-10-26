package com.ocr.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho bảng LOP
 */
@Entity
@Table(name = "LOP")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Lop {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "MaLop", length = 15, nullable = false)
    @NotBlank(message = "Mã lớp không được để trống")
    @Size(max = 15, message = "Mã lớp tối đa 15 ký tự")
    private String maLop;

    @Column(name = "TenLop", length = 100, nullable = false)
    @NotBlank(message = "Tên lớp không được để trống")
    @Size(max = 100, message = "Tên lớp tối đa 100 ký tự")
    private String tenLop;

    @Column(name = "KhoaHoc", nullable = false)
    @NotNull(message = "Khóa học không được để trống")
    @Min(value = 2000, message = "Khóa học phải từ năm 2000")
    @Max(value = 2100, message = "Khóa học tối đa đến năm 2100")
    private Integer khoaHoc;

    // Quan hệ N - 1: Lớp thuộc 1 Khoa (bắt buộc)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaKhoa",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_lop_khoa")
    )
    @ToString.Exclude
    private Khoa khoa;

    // Quan hệ N - 1: Cố vấn học tập (không bắt buộc, có thể NULL)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "MaGVCoVan",
        referencedColumnName = "MaGV",
        foreignKey = @ForeignKey(name = "fk_lop_covan")
    )
    @ToString.Exclude
    private GiangVien coVanHocTap;

    // Quan hệ 1 - N: Lớp có nhiều Sinh viên
    @OneToMany(mappedBy = "lop", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<SinhVien> sinhViens = new ArrayList<>();
}
