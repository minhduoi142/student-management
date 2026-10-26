package com.ocr.service.impl;

import com.ocr.dto.request.SinhVienProfileUpdateRequest;
import com.ocr.dto.request.SinhVienRequest;
import com.ocr.dto.response.PageResponse;
import com.ocr.dto.response.SinhVienResponse;
import com.ocr.entity.Lop;
import com.ocr.entity.SinhVien;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.LopRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.service.SinhVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SinhVienServiceImpl implements SinhVienService {

    private final SinhVienRepository sinhVienRepository;
    private final LopRepository lopRepository;

    @Override
    public PageResponse<SinhVienResponse> getStudents(String keyword, String maLop, String maKhoa, Pageable pageable) {
        String kw = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String lop = (maLop != null && !maLop.trim().isEmpty()) ? maLop.trim() : null;
        String khoa = (maKhoa != null && !maKhoa.trim().isEmpty()) ? maKhoa.trim() : null;

        Page<SinhVien> page = sinhVienRepository.searchStudents(kw, lop, khoa, pageable);
        Page<SinhVienResponse> dtoPage = page.map(SinhVienResponse::fromEntity);
        return PageResponse.from(dtoPage);
    }

    @Override
    public SinhVienResponse getStudentById(String maSV) {
        SinhVien sv = sinhVienRepository.findById(maSV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với mã: " + maSV));
        return SinhVienResponse.fromEntity(sv);
    }

    @Override
    @Transactional
    public SinhVienResponse createStudent(SinhVienRequest request) {
        String maSV = request.maSV().trim();
        if (sinhVienRepository.existsById(maSV)) {
            throw new DuplicateResourceException("Mã sinh viên '" + maSV + "' đã tồn tại.");
        }

        if (request.email() != null && !request.email().trim().isEmpty()) {
            if (sinhVienRepository.existsByEmail(request.email().trim())) {
                throw new DuplicateResourceException("Email '" + request.email() + "' đã được sử dụng bởi sinh viên khác.");
            }
        }

        Lop lop = lopRepository.findById(request.maLop().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học với mã: " + request.maLop()));

        SinhVien sv = SinhVien.builder()
                .maSV(maSV)
                .hoTen(request.hoTen().trim())
                .ngaySinh(request.ngaySinh())
                .gioiTinh(request.gioiTinh())
                .diaChi(request.diaChi() != null && !request.diaChi().trim().isEmpty() ? request.diaChi().trim() : null)
                .email(request.email() != null && !request.email().trim().isEmpty() ? request.email().trim() : null)
                .soDienThoai(request.soDienThoai() != null && !request.soDienThoai().trim().isEmpty() ? request.soDienThoai().trim() : null)
                .lop(lop)
                .build();

        SinhVien saved = sinhVienRepository.save(sv);
        return SinhVienResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public SinhVienResponse updateStudent(String maSV, SinhVienRequest request) {
        SinhVien sv = sinhVienRepository.findById(maSV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với mã: " + maSV));

        if (request.email() != null && !request.email().trim().isEmpty()) {
            if (sinhVienRepository.existsByEmailAndMaSVNot(request.email().trim(), maSV)) {
                throw new DuplicateResourceException("Email '" + request.email() + "' đã được sử dụng bởi sinh viên khác.");
            }
        }

        Lop lop = lopRepository.findById(request.maLop().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lớp học với mã: " + request.maLop()));

        sv.setHoTen(request.hoTen().trim());
        sv.setNgaySinh(request.ngaySinh());
        sv.setGioiTinh(request.gioiTinh());
        sv.setDiaChi(request.diaChi() != null && !request.diaChi().trim().isEmpty() ? request.diaChi().trim() : null);
        sv.setEmail(request.email() != null && !request.email().trim().isEmpty() ? request.email().trim() : null);
        sv.setSoDienThoai(request.soDienThoai() != null && !request.soDienThoai().trim().isEmpty() ? request.soDienThoai().trim() : null);
        sv.setLop(lop);

        SinhVien updated = sinhVienRepository.save(sv);
        return SinhVienResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public SinhVienResponse updateProfile(String maSV, SinhVienProfileUpdateRequest request) {
        SinhVien sv = sinhVienRepository.findById(maSV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với mã: " + maSV));

        if (request.email() != null && !request.email().trim().isEmpty()) {
            if (sinhVienRepository.existsByEmailAndMaSVNot(request.email().trim(), maSV)) {
                throw new DuplicateResourceException("Email '" + request.email() + "' đã được sử dụng bởi sinh viên khác.");
            }
            sv.setEmail(request.email().trim());
        }

        if (request.diaChi() != null) {
            sv.setDiaChi(request.diaChi().trim().isEmpty() ? null : request.diaChi().trim());
        }

        if (request.soDienThoai() != null) {
            sv.setSoDienThoai(request.soDienThoai().trim().isEmpty() ? null : request.soDienThoai().trim());
        }

        SinhVien updated = sinhVienRepository.save(sv);
        return SinhVienResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteStudent(String maSV) {
        if (!sinhVienRepository.existsById(maSV)) {
            throw new ResourceNotFoundException("Không tìm thấy sinh viên với mã: " + maSV);
        }
        // Xóa sinh viên -> tự động xóa cascade toàn bộ kết quả học tập liên quan
        sinhVienRepository.deleteById(maSV);
    }
}
