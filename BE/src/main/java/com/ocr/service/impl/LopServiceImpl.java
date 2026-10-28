package com.ocr.service.impl;

import com.ocr.dto.request.LopRequest;
import com.ocr.dto.response.LopResponse;
import com.ocr.entity.GiangVien;
import com.ocr.entity.Khoa;
import com.ocr.entity.Lop;
import com.ocr.exception.BadRequestException;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.KhoaRepository;
import com.ocr.repository.LopRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.service.LopService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LopServiceImpl implements LopService {

    private final LopRepository lopRepository;
    private final KhoaRepository khoaRepository;
    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;

    @Override
    public List<LopResponse> getAllLop(String maKhoa) {
        List<Lop> list;
        if (maKhoa != null && !maKhoa.trim().isEmpty()) {
            list = lopRepository.findByKhoa_MaKhoa(maKhoa.trim());
        } else {
            list = lopRepository.findAll();
        }
        return list.stream().map(LopResponse::fromEntity).toList();
    }

    @Override
    public LopResponse getLopById(String maLop) {
        Lop lop = lopRepository.findById(maLop)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với mã: " + maLop));
        return LopResponse.fromEntity(lop);
    }

    @Override
    @Transactional
    public LopResponse createLop(LopRequest request) {
        if (lopRepository.existsById(request.maLop().trim())) {
            throw new DuplicateResourceException("Mã lớp '" + request.maLop() + "' đã tồn tại.");
        }

        Khoa khoa = khoaRepository.findById(request.maKhoa().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khoa với mã: " + request.maKhoa()));

        GiangVien coVan = null;
        if (request.maGVCoVan() != null 
                && !request.maGVCoVan().trim().isEmpty() 
                && !"NONE".equalsIgnoreCase(request.maGVCoVan().trim())
                && !"null".equalsIgnoreCase(request.maGVCoVan().trim())) {
            coVan = giangVienRepository.findById(request.maGVCoVan().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên cố vấn với mã: " + request.maGVCoVan()));
        }

        Lop lop = Lop.builder()
                .maLop(request.maLop().trim())
                .tenLop(request.tenLop().trim())
                .khoaHoc(request.khoaHoc())
                .khoa(khoa)
                .coVanHocTap(coVan)
                .build();

        Lop saved = lopRepository.save(lop);
        return LopResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public LopResponse updateLop(String maLop, LopRequest request) {
        Lop lop = lopRepository.findById(maLop)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp với mã: " + maLop));

        Khoa khoa = khoaRepository.findById(request.maKhoa().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khoa với mã: " + request.maKhoa()));

        GiangVien coVan = null;
        if (request.maGVCoVan() != null 
                && !request.maGVCoVan().trim().isEmpty() 
                && !"NONE".equalsIgnoreCase(request.maGVCoVan().trim())
                && !"null".equalsIgnoreCase(request.maGVCoVan().trim())) {
            coVan = giangVienRepository.findById(request.maGVCoVan().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên cố vấn với mã: " + request.maGVCoVan()));
        }

        lop.setTenLop(request.tenLop().trim());
        lop.setKhoaHoc(request.khoaHoc());
        lop.setKhoa(khoa);
        lop.setCoVanHocTap(coVan);

        Lop updated = lopRepository.save(lop);
        return LopResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteLop(String maLop) {
        if (!lopRepository.existsById(maLop)) {
            throw new ResourceNotFoundException("Không tìm thấy lớp với mã: " + maLop);
        }

        if (sinhVienRepository.existsByLop_MaLop(maLop)) {
            throw new BadRequestException("Không thể xóa lớp '" + maLop + "' vì đang có sinh viên thuộc lớp này.");
        }

        lopRepository.deleteById(maLop);
    }
}
