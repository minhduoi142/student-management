package com.ocr.service.impl;

import com.ocr.dto.request.KhoaRequest;
import com.ocr.dto.response.KhoaResponse;
import com.ocr.entity.Khoa;
import com.ocr.exception.BadRequestException;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.KhoaRepository;
import com.ocr.repository.LopRepository;
import com.ocr.service.KhoaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KhoaServiceImpl implements KhoaService {

    private final KhoaRepository khoaRepository;
    private final GiangVienRepository giangVienRepository;
    private final LopRepository lopRepository;

    @Override
    public List<KhoaResponse> getAllKhoa() {
        return khoaRepository.findAll()
                .stream()
                .map(KhoaResponse::fromEntity)
                .toList();
    }

    @Override
    public KhoaResponse getKhoaById(String maKhoa) {
        Khoa khoa = khoaRepository.findById(maKhoa)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khoa với mã: " + maKhoa));
        return KhoaResponse.fromEntity(khoa);
    }

    @Override
    @Transactional
    public KhoaResponse createKhoa(KhoaRequest request) {
        if (khoaRepository.existsById(request.maKhoa())) {
            throw new DuplicateResourceException("Mã khoa '" + request.maKhoa() + "' đã tồn tại trong hệ thống.");
        }
        if (khoaRepository.existsByTenKhoa(request.tenKhoa())) {
            throw new DuplicateResourceException("Tên khoa '" + request.tenKhoa() + "' đã tồn tại trong hệ thống.");
        }

        Khoa khoa = Khoa.builder()
                .maKhoa(request.maKhoa().trim())
                .tenKhoa(request.tenKhoa().trim())
                .build();

        Khoa saved = khoaRepository.save(khoa);
        return KhoaResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public KhoaResponse updateKhoa(String maKhoa, KhoaRequest request) {
        Khoa khoa = khoaRepository.findById(maKhoa)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khoa với mã: " + maKhoa));

        if (khoaRepository.existsByTenKhoaAndMaKhoaNot(request.tenKhoa().trim(), maKhoa)) {
            throw new DuplicateResourceException("Tên khoa '" + request.tenKhoa() + "' đã được sử dụng bởi khoa khác.");
        }

        khoa.setTenKhoa(request.tenKhoa().trim());
        Khoa updated = khoaRepository.save(khoa);
        return KhoaResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteKhoa(String maKhoa) {
        if (!khoaRepository.existsById(maKhoa)) {
            throw new ResourceNotFoundException("Không tìm thấy khoa với mã: " + maKhoa);
        }

        if (giangVienRepository.existsByKhoa_MaKhoa(maKhoa)) {
            throw new BadRequestException("Không thể xóa khoa '" + maKhoa + "' vì đang có giảng viên công tác.");
        }

        if (lopRepository.existsByKhoa_MaKhoa(maKhoa)) {
            throw new BadRequestException("Không thể xóa khoa '" + maKhoa + "' vì đang có lớp học trực thuộc.");
        }

        khoaRepository.deleteById(maKhoa);
    }
}
