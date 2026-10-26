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
        return GioiTinh.fromValue(dbData);
    }
}
