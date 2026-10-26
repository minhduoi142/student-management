package com.ocr.entity;

import com.ocr.entity.id.KetQuaId;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Entity đại diện cho bảng KETQUA (Thực thể yếu với Composite Key: MaSV, MaMH, MaHK)
 */
@Entity
@Table(name = "KETQUA")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class KetQua {

    @EmbeddedId
    @EqualsAndHashCode.Include
    @Builder.Default
    private KetQuaId id = new KetQuaId();

    // Khóa ngoại liên kết tới SINHVIEN (ON DELETE CASCADE)
    @MapsId("maSV")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaSV",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ketqua_sv")
    )
    @ToString.Exclude
    private SinhVien sinhVien;

    // Khóa ngoại liên kết tới MONHOC (ON DELETE RESTRICT)
    @MapsId("maMH")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaMH",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ketqua_mh")
    )
    @ToString.Exclude
    private MonHoc monHoc;

    // Khóa ngoại liên kết tới HOCKY (ON DELETE RESTRICT)
    @MapsId("maHK")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "MaHK",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_ketqua_hk")
    )
    @ToString.Exclude
    private HocKy hocKy;

    @Column(name = "DiemCC", precision = 4, scale = 2)
    @DecimalMin(value = "0.00", message = "Điểm chuyên cần phải từ 0.00 trở lên")
    @DecimalMax(value = "10.00", message = "Điểm chuyên cần tối đa là 10.00")
    @Digits(integer = 2, fraction = 2, message = "Điểm chuyên cần tối đa 2 chữ số nguyên và 2 chữ số thập phân")
    private BigDecimal diemCC;

    @Column(name = "DiemGK", precision = 4, scale = 2)
    @DecimalMin(value = "0.00", message = "Điểm giữa kỳ phải từ 0.00 trở lên")
    @DecimalMax(value = "10.00", message = "Điểm giữa kỳ tối đa là 10.00")
    @Digits(integer = 2, fraction = 2, message = "Điểm giữa kỳ tối đa 2 chữ số nguyên và 2 chữ số thập phân")
    private BigDecimal diemGK;

    @Column(name = "DiemCK", precision = 4, scale = 2)
    @DecimalMin(value = "0.00", message = "Điểm cuối kỳ phải từ 0.00 trở lên")
    @DecimalMax(value = "10.00", message = "Điểm cuối kỳ tối đa là 10.00")
    @Digits(integer = 2, fraction = 2, message = "Điểm cuối kỳ tối đa 2 chữ số nguyên và 2 chữ số thập phân")
    private BigDecimal diemCK;

    /**
     * Constructor tiện lợi khởi tạo KetQua với đầy đủ 3 thực thể chủ và đồng bộ composite key
     */
    public KetQua(SinhVien sinhVien, MonHoc monHoc, HocKy hocKy) {
        this.sinhVien = sinhVien;
        this.monHoc = monHoc;
        this.hocKy = hocKy;
        this.id = new KetQuaId(
            sinhVien != null ? sinhVien.getMaSV() : null,
            monHoc != null ? monHoc.getMaMH() : null,
            hocKy != null ? hocKy.getMaHK() : null
        );
    }

    /**
     * Thuộc tính dẫn xuất: Điểm tổng kết hệ 10 (tính theo công thức quy định: DiemTong = CC*0.1 + GK*0.3 + CK*0.6).
     * Schema quy định KHÔNG lưu cột này trong DB mà tính toán qua view hoặc code.
     */
    @Transient
    public BigDecimal getDiemTongKet() {
        if (diemCC == null || diemGK == null || diemCK == null) {
            return null; // Chưa đủ đầu điểm
        }
        BigDecimal cc = diemCC.multiply(new BigDecimal("0.10"));
        BigDecimal gk = diemGK.multiply(new BigDecimal("0.30"));
        BigDecimal ck = diemCK.multiply(new BigDecimal("0.60"));
        return cc.add(gk).add(ck).setScale(2, RoundingMode.HALF_UP);
    }
}
