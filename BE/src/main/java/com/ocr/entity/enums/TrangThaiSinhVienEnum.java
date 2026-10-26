package com.ocr.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

/**
 * Enum đại diện cho trạng thái học tập của sinh viên
 * Các giá trị: DANG_HOC, BAO_LUU, TOT_NGHIEP, BUOC_THOI_HOC
 */
@Getter
public enum TrangThaiSinhVienEnum {
    DANG_HOC("DANG_HOC", "Đang học"),
    BAO_LUU("BAO_LUU", "Bảo lưu"),
    TOT_NGHIEP("TOT_NGHIEP", "Tốt nghiệp"),
    BUOC_THOI_HOC("BUOC_THOI_HOC", "Buộc thôi học");

    private final String code;
    private final String moTa;

    TrangThaiSinhVienEnum(String code, String moTa) {
        this.code = code;
        this.moTa = moTa;
    }

    @JsonValue
    public String getCode() {
        return code;
    }

    @JsonCreator
    public static TrangThaiSinhVienEnum fromValue(String value) {
        if (value == null) {
            return null;
        }
        return Arrays.stream(TrangThaiSinhVienEnum.values())
                .filter(tt -> tt.code.equalsIgnoreCase(value.trim()) || tt.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Trạng thái sinh viên không hợp lệ: " + value + 
                        ". Chấp nhận: DANG_HOC, BAO_LUU, TOT_NGHIEP, BUOC_THOI_HOC."));
    }
}
