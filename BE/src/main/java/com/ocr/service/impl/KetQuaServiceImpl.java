package com.ocr.service.impl;

import com.ocr.dto.request.KetQuaRequest;
import com.ocr.dto.response.BangDiemSinhVienResponse;
import com.ocr.dto.response.KetQuaResponse;
import com.ocr.entity.HocKy;
import com.ocr.entity.KetQua;
import com.ocr.entity.MonHoc;
import com.ocr.entity.SinhVien;
import com.ocr.entity.id.KetQuaId;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.HocKyRepository;
import com.ocr.repository.KetQuaRepository;
import com.ocr.repository.MonHocRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.service.KetQuaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class KetQuaServiceImpl implements KetQuaService {

    private final KetQuaRepository ketQuaRepository;
    private final SinhVienRepository sinhVienRepository;
    private final MonHocRepository monHocRepository;
    private final HocKyRepository hocKyRepository;

    @Override
    @Transactional
    public KetQuaResponse saveOrUpdateDiem(KetQuaRequest request) {
        String maSV = request.maSV().trim();
        String maMH = request.maMH().trim();
        String maHK = request.maHK().trim();

        SinhVien sinhVien = sinhVienRepository.findById(maSV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với mã: " + maSV));

        MonHoc monHoc = monHocRepository.findById(maMH)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy môn học với mã: " + maMH));

        HocKy hocKy = hocKyRepository.findById(maHK)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy học kỳ với mã: " + maHK));

        KetQuaId id = new KetQuaId(maSV, maMH, maHK);
        KetQua ketQua = ketQuaRepository.findById(id)
                .orElseGet(() -> new KetQua(sinhVien, monHoc, hocKy));

        // Cập nhật các đầu điểm
        if (request.diemCC() != null) {
            ketQua.setDiemCC(request.diemCC());
        }
        if (request.diemGK() != null) {
            ketQua.setDiemGK(request.diemGK());
        }
        if (request.diemCK() != null) {
            ketQua.setDiemCK(request.diemCK());
        }

        KetQua saved = ketQuaRepository.save(ketQua);
        return KetQuaResponse.fromEntity(saved);
    }

    @Override
    public BangDiemSinhVienResponse getBangDiemSinhVien(String maSV, String maHK) {
        SinhVien sv = sinhVienRepository.findById(maSV.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên với mã: " + maSV));

        List<KetQua> ketQuas;
        if (maHK != null && !maHK.trim().isEmpty()) {
            ketQuas = ketQuaRepository.findById_MaSVAndId_MaHK(maSV.trim(), maHK.trim());
        } else {
            ketQuas = ketQuaRepository.findById_MaSV(maSV.trim());
        }

        List<KetQuaResponse> danhSachDiem = ketQuas.stream()
                .map(KetQuaResponse::fromEntity)
                .toList();

        // Tính toán tổng số tín chỉ tích lũy (các môn có điểm tổng kết >= 4.0)
        int tongTinChiTichLuy = 0;
        BigDecimal tongDiemNhanTinChi = BigDecimal.ZERO;
        int tongTinChiXetDiem = 0;

        for (KetQua kq : ketQuas) {
            BigDecimal tong = kq.getDiemTongKet();
            int tinChi = (kq.getMonHoc() != null && kq.getMonHoc().getSoTinChi() != null) ? kq.getMonHoc().getSoTinChi() : 0;

            if (tong != null && tinChi > 0) {
                if (tong.compareTo(new BigDecimal("4.00")) >= 0) {
                    tongTinChiTichLuy += tinChi;
                }
                tongDiemNhanTinChi = tongDiemNhanTinChi.add(tong.multiply(BigDecimal.valueOf(tinChi)));
                tongTinChiXetDiem += tinChi;
            }
        }

        BigDecimal diemTrungBinh = null;
        if (tongTinChiXetDiem > 0) {
            diemTrungBinh = tongDiemNhanTinChi.divide(BigDecimal.valueOf(tongTinChiXetDiem), 2, RoundingMode.HALF_UP);
        }

        return new BangDiemSinhVienResponse(
                sv.getMaSV(),
                sv.getHoTen(),
                sv.getLop() != null ? sv.getLop().getMaLop() : null,
                sv.getLop() != null ? sv.getLop().getTenLop() : null,
                sv.getLop() != null && sv.getLop().getKhoa() != null ? sv.getLop().getKhoa().getTenKhoa() : null,
                danhSachDiem,
                tongTinChiTichLuy,
                diemTrungBinh
        );
    }

    @Override
    public List<KetQuaResponse> getDiemByMonHoc(String maMH, String maHK) {
        if (!monHocRepository.existsById(maMH.trim())) {
            throw new ResourceNotFoundException("Không tìm thấy môn học với mã: " + maMH);
        }

        List<KetQua> ketQuas;
        if (maHK != null && !maHK.trim().isEmpty()) {
            ketQuas = ketQuaRepository.findById_MaMHAndId_MaHK(maMH.trim(), maHK.trim());
        } else {
            ketQuas = ketQuaRepository.findById_MaMH(maMH.trim());
        }

        return ketQuas.stream().map(KetQuaResponse::fromEntity).toList();
    }

    @Override
    @Transactional
    public void deleteDiem(String maSV, String maMH, String maHK) {
        KetQuaId id = new KetQuaId(maSV.trim(), maMH.trim(), maHK.trim());
        if (!ketQuaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy kết quả điểm của sinh viên " + maSV + " cho môn " + maMH + " tại học kỳ " + maHK);
        }
        ketQuaRepository.deleteById(id);
    }
}
