package com.ocr.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

/**
 * Composite Primary Key cho bảng KETQUA: (MaSV, MaMH, MaHK)
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class KetQuaId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "MaSV", length = 15, nullable = false)
    private String maSV;

    @Column(name = "MaMH", length = 15, nullable = false)
    private String maMH;

    @Column(name = "MaHK", length = 10, nullable = false)
    private String maHK;
}
