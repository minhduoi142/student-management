package com.ocr.service;

import com.ocr.dto.request.HocKyRequest;
import com.ocr.dto.response.HocKyResponse;

import java.util.List;

public interface HocKyService {
    List<HocKyResponse> getAllHocKy();
    HocKyResponse getHocKyById(String maHK);
    HocKyResponse createHocKy(HocKyRequest request);
    HocKyResponse updateHocKy(String maHK, HocKyRequest request);
    void deleteHocKy(String maHK);
}
