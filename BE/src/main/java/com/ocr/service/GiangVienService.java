package com.ocr.service;

import com.ocr.dto.request.GiangVienRequest;
import com.ocr.dto.response.GiangVienResponse;
import com.ocr.dto.response.PhanCongResponse;

import java.util.List;

public interface GiangVienService {
    List<GiangVienResponse> getAllGiangVien(String maKhoa);
    GiangVienResponse getGiangVienById(String maGV);
    GiangVienResponse createGiangVien(GiangVienRequest request);
    GiangVienResponse updateGiangVien(String maGV, GiangVienRequest request);
    void deleteGiangVien(String maGV);
    List<PhanCongResponse> getPhanCongByGiangVien(String maGV, String maHK);
}
