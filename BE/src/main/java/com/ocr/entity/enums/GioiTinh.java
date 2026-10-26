package com.ocr.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

import java.util.Arrays;

/**
 * Enum đại diện cho giới tính của sinh viên, khớp với ràng buộc:
 * CONSTRAINT ck_sinhvien_gioitinh CHECK (GioiTinh IN ('Nam', 'Nữ'))
 */
@Getter
public enum GioiTinh {
    NAM("Nam"),
    NU("Nữ");

    private final String value;

    GioiTinh(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static GioiTinh fromValue(String value) {
        if (value == null) {
            return null;
        }
        return Arrays.stream(GioiTinh.values())
                .filter(gt -> gt.value.equalsIgnoreCase(value.trim()) || gt.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Giới tính không hợp lệ: " + value + ". Chấp nhận 'Nam' hoặc 'Nữ'."));
    }
}
