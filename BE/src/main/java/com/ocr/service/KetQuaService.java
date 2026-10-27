package com.ocr.service;

import com.ocr.dto.request.BatchKetQuaRequest;
import com.ocr.dto.request.KetQuaRequest;
import com.ocr.dto.response.BangDiemSinhVienResponse;
import com.ocr.dto.response.KetQuaResponse;
import com.ocr.dto.response.LopHocPhanDiemResponse;

import java.util.List;

public interface KetQuaService {
    KetQuaResponse saveOrUpdateDiem(KetQuaRequest request);
    List<KetQuaResponse> saveBatchDiem(BatchKetQuaRequest request);
    BangDiemSinhVienResponse getBangDiemSinhVien(String maSV, String maHK);
    List<KetQuaResponse> getDiemByMonHoc(String maMH, String maHK);
    LopHocPhanDiemResponse getDiemLopHocPhan(String maLop, String maMH, String maHK);
    void deleteDiem(String maSV, String maMH, String maHK);
}
