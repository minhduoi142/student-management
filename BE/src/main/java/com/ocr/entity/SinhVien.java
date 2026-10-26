package com.ocr.entity;

import com.ocr.entity.converter.GioiTinhConverter;
import com.ocr.entity.enums.GioiTinh;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho bảng SINHVIEN
 */
@Entity
@Table(
    name = "SINHVIEN",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_sinhvien_email", columnNames = {"Email"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class SinhVien {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "MaSV", length = 15, nullable = false)
    @NotBlank(message = "Mã sinh viên không được để trống")
    @Size(max = 15, message = "Mã sinh viên tối đa 15 ký tự")
    private String maSV;

    @Column(name = "HoTen", length = 100, nullable = false)
    @NotBlank(message = "Họ tên sinh viên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String hoTen;

    @Column(name = "NgaySinh", nullable = false)
    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải trong quá khứ")
    private LocalDate ngaySinh;

    @Column(name = "GioiTinh", length = 5, nullable = false)
    @Convert(converter = GioiTinhConverter.class)
    @NotNull(message = "Giới tính không được để trống")
    private GioiTinh gioiTinh;

    @Column(name = "DiaChi", length = 255)
    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String diaChi;

    @Column(name = "Email", length = 100, unique = true)
    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    private String email;

    @Column(name = "SoDienThoai", length = 15)
    @Size(max = 15, message = "Số điện thoại tối đa 15 ký tự")
    private String soDienThoai;

    // Quan hệ N - 1: Sinh viên thuộc 1 Lớp (bắt buộc)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaLop",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_sinhvien_lop")
    )
    @ToString.Exclude
    private Lop lop;

    // Quan hệ 1 - N: Một sinh viên có nhiều Kết quả học tập (xóa SV -> xóa luôn Kết quả)
    @OneToMany(mappedBy = "sinhVien", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<KetQua> ketQuas = new ArrayList<>();
}
