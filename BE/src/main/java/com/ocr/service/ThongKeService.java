package com.ocr.service;

import com.ocr.dto.response.*;

import java.math.BigDecimal;
import java.util.List;

public interface ThongKeService {
    List<SiSoLopResponse> getSiSoLop();
    List<DiemTrungBinhMonResponse> getDiemTrungBinhMon();
    List<SinhVienDiemGioiResponse> getSinhVienDiemCao(String maMH, BigDecimal minDiemCK);
    List<SinhVienResponse> getSinhVienChuaCoDiem();
    List<ThongKeHocKyResponse> getThongKeSoLuongKetQuaTheoHocKy();
    List<MonHocResponse> getMonHocChuaCoKetQua();
    DashboardOverviewResponse getDashboardOverview();
}
