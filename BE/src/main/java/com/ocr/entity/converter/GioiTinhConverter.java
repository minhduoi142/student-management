package com.ocr.entity.converter;

import com.ocr.entity.enums.GioiTinh;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA AttributeConverter chuyển đổi giữa Enum GioiTinh và String trong Database ('Nam', 'Nữ').
 */
@Converter(autoApply = true)
public class GioiTinhConverter implements AttributeConverter<GioiTinh, String> {

    @Override
    public String convertToDatabaseColumn(GioiTinh attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public GioiTinh convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return null;
        }

        String normalized = dbData.trim();

        // 1. Khớp chính xác hoặc không phân biệt hoa thường
        for (GioiTinh gt : GioiTinh.values()) {
            if (gt.getValue().equalsIgnoreCase(normalized) || gt.name().equalsIgnoreCase(normalized)) {
                return gt;
            }
        }

        // 2. Xử lý trường hợp chuỗi bị lỗi Encoding UTF-8 (ví dụ Nữ bị thành N? hoặc ký tự rác)
        // Bất kỳ chuỗi nào bắt đầu bằng 'N' không phải 'Nam' hoặc chứa 'u'/'ữ'/'?'
        String lower = normalized.toLowerCase();
        if (lower.startsWith("nam") || lower.equals("m") || lower.equals("1")) {
            return GioiTinh.NAM;
        }
        if (lower.startsWith("n") || lower.equals("f") || lower.equals("0")) {
            return GioiTinh.NU;
        }

        return GioiTinh.NAM;
    }
}
