package com.ocr.service;

import com.ocr.dto.request.MonHocRequest;
import com.ocr.dto.response.MonHocResponse;

import java.util.List;

public interface MonHocService {
    List<MonHocResponse> getAllMonHoc();
    MonHocResponse getMonHocById(String maMH);
    MonHocResponse createMonHoc(MonHocRequest request);
    MonHocResponse updateMonHoc(String maMH, MonHocRequest request);
    void deleteMonHoc(String maMH);
}
