package com.ocr.service;

import com.ocr.dto.request.LopRequest;
import com.ocr.dto.response.LopResponse;

import java.util.List;

public interface LopService {
    List<LopResponse> getAllLop(String maKhoa);
    LopResponse getLopById(String maLop);
    LopResponse createLop(LopRequest request);
    LopResponse updateLop(String maLop, LopRequest request);
    void deleteLop(String maLop);
}
