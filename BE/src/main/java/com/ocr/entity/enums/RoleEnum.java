package com.ocr.entity.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

/**
 * Enum đại diện cho vai trò tài khoản trong hệ thống
 * Ràng buộc: CHECK (Role IN ('ADMIN', 'GIANGVIEN', 'SINHVIEN'))
 */
public enum RoleEnum {
    ADMIN("ADMIN"),
    GIANGVIEN("GIANGVIEN"),
    SINHVIEN("SINHVIEN");

    private final String value;

    RoleEnum(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static RoleEnum fromValue(String value) {
        if (value == null) {
            return null;
        }
        return Arrays.stream(RoleEnum.values())
                .filter(role -> role.value.equalsIgnoreCase(value.trim()) || role.name().equalsIgnoreCase(value.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Vai trò không hợp lệ: " + value + ". Chấp nhận: ADMIN, GIANGVIEN, SINHVIEN."));
    }
}
