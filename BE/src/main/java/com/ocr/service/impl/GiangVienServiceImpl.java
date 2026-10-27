package com.ocr.service.impl;

import com.ocr.dto.request.GiangVienRequest;
import com.ocr.dto.response.GiangVienResponse;
import com.ocr.dto.response.PhanCongResponse;
import com.ocr.entity.GiangVien;
import com.ocr.entity.Khoa;
import com.ocr.entity.Lop;
import com.ocr.entity.PhanCong;
import com.ocr.entity.SinhVien;
import com.ocr.entity.id.KetQuaId;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.KetQuaRepository;
import com.ocr.repository.KhoaRepository;
import com.ocr.repository.LopRepository;
import com.ocr.repository.PhanCongRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.service.GiangVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GiangVienServiceImpl implements GiangVienService {

    private final GiangVienRepository giangVienRepository;
    private final KhoaRepository khoaRepository;
    private final LopRepository lopRepository;
    private final PhanCongRepository phanCongRepository;
    private final SinhVienRepository sinhVienRepository;
    private final KetQuaRepository ketQuaRepository;

    @Override
    public List<GiangVienResponse> getAllGiangVien(String maKhoa) {
        List<GiangVien> list;
        if (maKhoa != null && !maKhoa.trim().isEmpty()) {
            list = giangVienRepository.findByKhoa_MaKhoa(maKhoa.trim());
        } else {
            list = giangVienRepository.findAll();
        }
        return list.stream().map(GiangVienResponse::fromEntity).toList();
    }

    @Override
    public GiangVienResponse getGiangVienById(String maGV) {
        GiangVien gv = giangVienRepository.findById(maGV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên với mã: " + maGV));
        return GiangVienResponse.fromEntity(gv);
    }

    @Override
    @Transactional
    public GiangVienResponse createGiangVien(GiangVienRequest request) {
        if (giangVienRepository.existsById(request.maGV().trim())) {
            throw new DuplicateResourceException("Mã giảng viên '" + request.maGV() + "' đã tồn tại.");
        }

        if (request.email() != null && !request.email().trim().isEmpty()) {
            if (giangVienRepository.existsByEmail(request.email().trim())) {
                throw new DuplicateResourceException("Email '" + request.email() + "' đã được sử dụng bởi giảng viên khác.");
            }
        }

        Khoa khoa = khoaRepository.findById(request.maKhoa().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khoa với mã: " + request.maKhoa()));

        GiangVien gv = GiangVien.builder()
                .maGV(request.maGV().trim())
                .hoTen(request.hoTen().trim())
                .email(request.email() != null && !request.email().trim().isEmpty() ? request.email().trim() : null)
                .soDienThoai(request.soDienThoai() != null && !request.soDienThoai().trim().isEmpty() ? request.soDienThoai().trim() : null)
                .khoa(khoa)
                .build();

        GiangVien saved = giangVienRepository.save(gv);
        return GiangVienResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public GiangVienResponse updateGiangVien(String maGV, GiangVienRequest request) {
        GiangVien gv = giangVienRepository.findById(maGV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên với mã: " + maGV));

        if (request.email() != null && !request.email().trim().isEmpty()) {
            if (giangVienRepository.existsByEmailAndMaGVNot(request.email().trim(), maGV)) {
                throw new DuplicateResourceException("Email '" + request.email() + "' đã được sử dụng bởi giảng viên khác.");
            }
        }

        Khoa khoa = khoaRepository.findById(request.maKhoa().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khoa với mã: " + request.maKhoa()));

        gv.setHoTen(request.hoTen().trim());
        gv.setEmail(request.email() != null && !request.email().trim().isEmpty() ? request.email().trim() : null);
        gv.setSoDienThoai(request.soDienThoai() != null && !request.soDienThoai().trim().isEmpty() ? request.soDienThoai().trim() : null);
        gv.setKhoa(khoa);

        GiangVien updated = giangVienRepository.save(gv);
        return GiangVienResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteGiangVien(String maGV) {
        if (!giangVienRepository.existsById(maGV)) {
            throw new ResourceNotFoundException("Không tìm thấy giảng viên với mã: " + maGV);
        }

        List<Lop> lopsCoVan = lopRepository.findByCoVanHocTap_MaGV(maGV);
        if (!lopsCoVan.isEmpty()) {
            for (Lop lop : lopsCoVan) {
                lop.setCoVanHocTap(null);
            }
            lopRepository.saveAll(lopsCoVan);
        }

        giangVienRepository.deleteById(maGV);
    }

    @Override
    public List<PhanCongResponse> getPhanCongByGiangVien(String maGV, String maHK) {
        if (!giangVienRepository.existsById(maGV.trim())) {
            throw new ResourceNotFoundException("Không tìm thấy giảng viên với mã: " + maGV);
        }

        List<PhanCong> list;
        if (maHK != null && !maHK.trim().isEmpty()) {
            list = phanCongRepository.findByGiangVien_MaGVAndHocKy_MaHK(maGV.trim(), maHK.trim());
        } else {
            list = phanCongRepository.findByGiangVien_MaGV(maGV.trim());
        }

        return list.stream().map(pc -> {
            String maLop = pc.getLop() != null ? pc.getLop().getMaLop() : null;
            String tenLop = pc.getLop() != null ? pc.getLop().getTenLop() : null;
            String maMH = pc.getMonHoc() != null ? pc.getMonHoc().getMaMH() : null;
            String tenMH = pc.getMonHoc() != null ? pc.getMonHoc().getTenMH() : null;
            Integer soTinChi = pc.getMonHoc() != null ? pc.getMonHoc().getSoTinChi() : null;
            String hk = pc.getHocKy() != null ? pc.getHocKy().getMaHK() : null;
            String tenHK = pc.getHocKy() != null ? pc.getHocKy().getTenHocKy() : null;

            int siSo = 0;
            int soLuongCoDiem = 0;
            if (maLop != null) {
                List<SinhVien> svList = sinhVienRepository.findByLop_MaLop(maLop);
                siSo = svList.size();
                if (maMH != null && hk != null) {
                    for (SinhVien sv : svList) {
                        KetQuaId id = new KetQuaId(sv.getMaSV(), maMH, hk);
                        if (ketQuaRepository.existsById(id)) {
                            soLuongCoDiem++;
                        }
                    }
                }
            }

            return PhanCongResponse.builder()
                    .maPC(pc.getMaPC())
                    .maGV(pc.getGiangVien() != null ? pc.getGiangVien().getMaGV() : maGV)
                    .tenGV(pc.getGiangVien() != null ? pc.getGiangVien().getHoTen() : null)
                    .maMH(maMH)
                    .tenMH(tenMH)
                    .soTinChi(soTinChi)
                    .maLop(maLop)
                    .tenLop(tenLop)
                    .maHK(hk)
                    .tenHK(tenHK)
                    .siSo(siSo)
                    .soLuongCoDiem(soLuongCoDiem)
                    .build();
        }).toList();
    }
}
