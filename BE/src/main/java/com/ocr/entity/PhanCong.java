package com.ocr.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Entity đại diện cho bảng PHANCONG (Phân công giảng dạy, làm căn cứ phân quyền nhập điểm)
 */
@Entity
@Table(
    name = "PHANCONG",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_phancong", columnNames = {"MaMH", "MaLop", "MaHK"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class PhanCong {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "MaPC")
    private Long maPC;

    // Quan hệ N - 1: Phân công cho một Giảng viên
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaGV",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_pc_gv")
    )
    @NotNull(message = "Giảng viên không được để trống")
    @ToString.Exclude
    private GiangVien giangVien;

    // Quan hệ N - 1: Phân công môn học
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaMH",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_pc_mh")
    )
    @NotNull(message = "Môn học không được để trống")
    @ToString.Exclude
    private MonHoc monHoc;

    // Quan hệ N - 1: Phân công lớp học
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaLop",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_pc_lop")
    )
    @NotNull(message = "Lớp không được để trống")
    @ToString.Exclude
    private Lop lop;

    // Quan hệ N - 1: Phân công học kỳ
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaHK",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_pc_hk")
    )
    @NotNull(message = "Học kỳ không được để trống")
    @ToString.Exclude
    private HocKy hocKy;
}
