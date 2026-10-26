package com.ocr.service.impl;

import com.ocr.dto.response.*;
import com.ocr.entity.KetQua;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.*;
import com.ocr.service.ThongKeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThongKeServiceImpl implements ThongKeService {

    private final KhoaRepository khoaRepository;
    private final GiangVienRepository giangVienRepository;
    private final LopRepository lopRepository;
    private final SinhVienRepository sinhVienRepository;
    private final MonHocRepository monHocRepository;
    private final HocKyRepository hocKyRepository;
    private final KetQuaRepository ketQuaRepository;

    @Override
    public List<SiSoLopResponse> getSiSoLop() {
        // Câu 6: Thống kê số lượng sinh viên theo từng lớp
        return lopRepository.getThongKeSiSoLop();
    }

    @Override
    public List<DiemTrungBinhMonResponse> getDiemTrungBinhMon() {
        // Câu 7: Tính điểm cuối kỳ trung bình của từng môn học
        List<Object[]> rows = ketQuaRepository.getDiemCKTrungBinhTungMonRaw();
        List<DiemTrungBinhMonResponse> result = new ArrayList<>();

        for (Object[] row : rows) {
            String maMH = (String) row[0];
            String tenMH = (String) row[1];
            Integer soTinChi = (Integer) row[2];

            BigDecimal avgDiemCK = null;
            if (row[3] != null) {
                if (row[3] instanceof Double d) {
                    avgDiemCK = BigDecimal.valueOf(d).setScale(2, RoundingMode.HALF_UP);
                } else if (row[3] instanceof BigDecimal bd) {
                    avgDiemCK = bd.setScale(2, RoundingMode.HALF_UP);
                }
            }

            long soLuongSV = ((Number) row[4]).longValue();

            result.add(new DiemTrungBinhMonResponse(maMH, tenMH, soTinChi, avgDiemCK, soLuongSV));
        }

        return result;
    }

    @Override
    public List<SinhVienDiemGioiResponse> getSinhVienDiemCao(String maMH, BigDecimal minDiemCK) {
        // Câu 8: Tìm sinh viên có điểm cuối kỳ >= minDiemCK (mặc định 8.0) ở một môn cụ thể
        if (!monHocRepository.existsById(maMH.trim())) {
            throw new ResourceNotFoundException("Không tìm thấy môn học với mã: " + maMH);
        }

        BigDecimal threshold = (minDiemCK != null) ? minDiemCK : new BigDecimal("8.00");
        List<KetQua> ketQuas = ketQuaRepository.findSinhVienDiemCaoTheoMon(maMH.trim(), threshold);

        return ketQuas.stream().map(kq -> new SinhVienDiemGioiResponse(
                kq.getSinhVien().getMaSV(),
                kq.getSinhVien().getHoTen(),
                kq.getSinhVien().getLop() != null ? kq.getSinhVien().getLop().getTenLop() : null,
                kq.getMonHoc().getMaMH(),
                kq.getMonHoc().getTenMH(),
                kq.getDiemCK(),
                kq.getDiemTongKet()
        )).toList();
    }

    @Override
    public List<SinhVienResponse> getSinhVienChuaCoDiem() {
        // Câu 9: Liệt kê sinh viên chưa có bản ghi kết quả nào (nợ bảng điểm)
        return sinhVienRepository.findSinhVienChuaCoDiem()
                .stream()
                .map(SinhVienResponse::fromEntity)
                .toList();
    }

    @Override
    public List<ThongKeHocKyResponse> getThongKeSoLuongKetQuaTheoHocKy() {
        // Câu 10: Thống kê số lượng bản ghi kết quả theo từng học kỳ
        List<Object[]> rows = ketQuaRepository.getThongKeSoLuongKetQuaTheoHocKyRaw();
        List<ThongKeHocKyResponse> result = new ArrayList<>();

        for (Object[] row : rows) {
            String maHK = (String) row[0];
            String namHoc = (String) row[1];
            Integer ky = (Integer) row[2];
            long count = ((Number) row[3]).longValue();

            String tenHocKy = (ky != null && ky == 3 ? "Học kỳ hè" : "Học kỳ " + ky) + " - Năm học " + namHoc;
            result.add(new ThongKeHocKyResponse(maHK, namHoc, ky, tenHocKy, count));
        }

        return result;
    }

    @Override
    public List<MonHocResponse> getMonHocChuaCoKetQua() {
        // Câu 15: Tìm môn học chưa có sinh viên nào có kết quả (chưa ai học)
        return monHocRepository.findMonHocChuaCoKetQua()
                .stream()
                .map(MonHocResponse::fromEntity)
                .toList();
    }

    @Override
    public DashboardOverviewResponse getDashboardOverview() {
        return new DashboardOverviewResponse(
                khoaRepository.count(),
                giangVienRepository.count(),
                lopRepository.count(),
                sinhVienRepository.count(),
                monHocRepository.count(),
                hocKyRepository.count(),
                ketQuaRepository.count()
        );
    }
}
