package com.ocr.service;

import com.ocr.dto.request.KhoaRequest;
import com.ocr.dto.response.KhoaResponse;

import java.util.List;

public interface KhoaService {
    List<KhoaResponse> getAllKhoa();
    KhoaResponse getKhoaById(String maKhoa);
    KhoaResponse createKhoa(KhoaRequest request);
    KhoaResponse updateKhoa(String maKhoa, KhoaRequest request);
    void deleteKhoa(String maKhoa);
}
