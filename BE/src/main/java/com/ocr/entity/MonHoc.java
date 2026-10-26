package com.ocr.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Entity đại diện cho bảng MONHOC
 */
@Entity
@Table(name = "MONHOC")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class MonHoc {

    @Id
    @EqualsAndHashCode.Include
    @Column(name = "MaMH", length = 15, nullable = false)
    @NotBlank(message = "Mã môn học không được để trống")
    @Size(max = 15, message = "Mã môn học tối đa 15 ký tự")
    private String maMH;

    @Column(name = "TenMH", length = 150, nullable = false)
    @NotBlank(message = "Tên môn học không được để trống")
    @Size(max = 150, message = "Tên môn học tối đa 150 ký tự")
    private String tenMH;

    @Column(name = "SoTinChi", nullable = false)
    @NotNull(message = "Số tín chỉ không được để trống")
    @Min(value = 1, message = "Số tín chỉ phải lớn hơn 0")
    private Integer soTinChi;

    // Quan hệ 1 - N: Môn học liên kết với nhiều Kết quả
    @OneToMany(mappedBy = "monHoc", fetch = FetchType.LAZY)
    @ToString.Exclude
    @Builder.Default
    private List<KetQua> ketQuas = new ArrayList<>();
}
