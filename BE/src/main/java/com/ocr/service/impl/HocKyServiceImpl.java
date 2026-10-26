package com.ocr.service.impl;

import com.ocr.dto.request.HocKyRequest;
import com.ocr.dto.response.HocKyResponse;
import com.ocr.entity.HocKy;
import com.ocr.exception.BadRequestException;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.HocKyRepository;
import com.ocr.repository.KetQuaRepository;
import com.ocr.service.HocKyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HocKyServiceImpl implements HocKyService {

    private final HocKyRepository hocKyRepository;
    private final KetQuaRepository ketQuaRepository;

    @Override
    public List<HocKyResponse> getAllHocKy() {
        return hocKyRepository.findAll()
                .stream()
                .map(HocKyResponse::fromEntity)
                .toList();
    }

    @Override
    public HocKyResponse getHocKyById(String maHK) {
        HocKy hocKy = hocKyRepository.findById(maHK)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học kỳ với mã: " + maHK));
        return HocKyResponse.fromEntity(hocKy);
    }

    @Override
    @Transactional
    public HocKyResponse createHocKy(HocKyRequest request) {
        if (hocKyRepository.existsById(request.maHK())) {
            throw new DuplicateResourceException("Mã học kỳ '" + request.maHK() + "' đã tồn tại.");
        }
        if (hocKyRepository.existsByNamHocAndKy(request.namHoc().trim(), request.ky())) {
            throw new DuplicateResourceException("Học kỳ " + request.ky() + " năm học '" + request.namHoc() + "' đã tồn tại.");
        }

        HocKy hocKy = HocKy.builder()
                .maHK(request.maHK().trim())
                .namHoc(request.namHoc().trim())
                .ky(request.ky())
                .build();

        HocKy saved = hocKyRepository.save(hocKy);
        return HocKyResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public HocKyResponse updateHocKy(String maHK, HocKyRequest request) {
        HocKy hocKy = hocKyRepository.findById(maHK)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học kỳ với mã: " + maHK));

        if (hocKyRepository.existsByNamHocAndKyAndMaHKNot(request.namHoc().trim(), request.ky(), maHK)) {
            throw new DuplicateResourceException("Học kỳ " + request.ky() + " năm học '" + request.namHoc() + "' đã tồn tại.");
        }

        hocKy.setNamHoc(request.namHoc().trim());
        hocKy.setKy(request.ky());

        HocKy updated = hocKyRepository.save(hocKy);
        return HocKyResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteHocKy(String maHK) {
        if (!hocKyRepository.existsById(maHK)) {
            throw new ResourceNotFoundException("Không tìm thấy học kỳ với mã: " + maHK);
        }

        if (ketQuaRepository.existsById_MaHK(maHK)) {
            throw new BadRequestException("Không thể xóa học kỳ '" + maHK + "' vì đã có kết quả điểm được ghi nhận.");
        }

        hocKyRepository.deleteById(maHK);
    }
}
