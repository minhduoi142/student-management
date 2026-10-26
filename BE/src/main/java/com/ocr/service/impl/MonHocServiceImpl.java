package com.ocr.service.impl;

import com.ocr.dto.request.MonHocRequest;
import com.ocr.dto.response.MonHocResponse;
import com.ocr.entity.MonHoc;
import com.ocr.exception.BadRequestException;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.KetQuaRepository;
import com.ocr.repository.MonHocRepository;
import com.ocr.service.MonHocService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MonHocServiceImpl implements MonHocService {

    private final MonHocRepository monHocRepository;
    private final KetQuaRepository ketQuaRepository;

    @Override
    public List<MonHocResponse> getAllMonHoc() {
        return monHocRepository.findAll()
                .stream()
                .map(MonHocResponse::fromEntity)
                .toList();
    }

    @Override
    public MonHocResponse getMonHocById(String maMH) {
        MonHoc monHoc = monHocRepository.findById(maMH)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với mã: " + maMH));
        return MonHocResponse.fromEntity(monHoc);
    }

    @Override
    @Transactional
    public MonHocResponse createMonHoc(MonHocRequest request) {
        if (monHocRepository.existsById(request.maMH())) {
            throw new DuplicateResourceException("Mã môn học '" + request.maMH() + "' đã tồn tại.");
        }
        if (monHocRepository.existsByTenMH(request.tenMH())) {
            throw new DuplicateResourceException("Tên môn học '" + request.tenMH() + "' đã tồn tại.");
        }

        MonHoc monHoc = MonHoc.builder()
                .maMH(request.maMH().trim())
                .tenMH(request.tenMH().trim())
                .soTinChi(request.soTinChi())
                .build();

        MonHoc saved = monHocRepository.save(monHoc);
        return MonHocResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public MonHocResponse updateMonHoc(String maMH, MonHocRequest request) {
        MonHoc monHoc = monHocRepository.findById(maMH)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với mã: " + maMH));

        if (monHocRepository.existsByTenMHAndMaMHNot(request.tenMH().trim(), maMH)) {
            throw new DuplicateResourceException("Tên môn học '" + request.tenMH() + "' đã được sử dụng bởi môn học khác.");
        }

        monHoc.setTenMH(request.tenMH().trim());
        monHoc.setSoTinChi(request.soTinChi());

        MonHoc updated = monHocRepository.save(monHoc);
        return MonHocResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteMonHoc(String maMH) {
        if (!monHocRepository.existsById(maMH)) {
            throw new ResourceNotFoundException("Không tìm thấy môn học với mã: " + maMH);
        }

        if (ketQuaRepository.existsById_MaMH(maMH)) {
            throw new BadRequestException("Không thể xóa môn học '" + maMH + "' vì đã có kết quả điểm được ghi nhận.");
        }

        monHocRepository.deleteById(maMH);
    }
}
