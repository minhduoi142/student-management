package com.ocr.service;

import com.ocr.dto.request.KetQuaRequest;
import com.ocr.dto.response.BangDiemSinhVienResponse;
import com.ocr.dto.response.KetQuaResponse;

import java.util.List;

public interface KetQuaService {
    KetQuaResponse saveOrUpdateDiem(KetQuaRequest request);
    BangDiemSinhVienResponse getBangDiemSinhVien(String maSV, String maHK);
    List<KetQuaResponse> getDiemByMonHoc(String maMH, String maHK);
    void deleteDiem(String maSV, String maMH, String maHK);
}
