package com.ocr.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho bảng HOCKY
 */
@Entity
@Table(
    name = "HOCKY",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_hocky_namky", columnNames = {"NamHoc", "Ky"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class HocKy {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "MaHK", length = 10, nullable = false)
    @NotBlank(message = "Mã học kỳ không được để trống")
    @Size(max = 10, message = "Mã học kỳ tối đa 10 ký tự")
    private String maHK;

    @Column(name = "NamHoc", length = 9, nullable = false)
    @NotBlank(message = "Năm học không được để trống")
    @Pattern(regexp = "^\\d{4}-\\d{4}$", message = "Năm học phải có định dạng YYYY-YYYY (ví dụ: 2025-2026)")
    private String namHoc;

    @Column(name = "Ky", nullable = false)
    @NotNull(message = "Kỳ học không được để trống")
    @Min(value = 1, message = "Kỳ học phải từ 1 đến 3")
    @Max(value = 3, message = "Kỳ học phải từ 1 đến 3")
    private Integer ky;

    // Quan hệ 1 - N: Học kỳ liên kết với nhiều Kết quả
    @OneToMany(mappedBy = "hocKy", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<KetQua> ketQuas = new ArrayList<>();

    /**
     * Tên học kỳ dẫn xuất từ Năm học và Kỳ (tránh dư thừa dữ liệu)
     * Ví dụ: "Học kỳ 1 năm học 2025-2026"
     */
    @Transient
    public String getTenHocKy() {
        if (ky == null || namHoc == null) {
            return null;
        }
        return (ky == 3 ? "Học kỳ hè" : "Học kỳ " + ky) + " - Năm học " + namHoc;
    }
}
