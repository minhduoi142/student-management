package com.ocr.service;

import com.ocr.dto.request.SinhVienProfileUpdateRequest;
import com.ocr.dto.request.SinhVienRequest;
import com.ocr.dto.response.PageResponse;
import com.ocr.dto.response.SinhVienResponse;
import org.springframework.data.domain.Pageable;

public interface SinhVienService {
    PageResponse<SinhVienResponse> getStudents(String keyword, String maLop, String maKhoa, Pageable pageable);
    SinhVienResponse getStudentById(String maSV);
    SinhVienResponse createStudent(SinhVienRequest request);
    SinhVienResponse updateStudent(String maSV, SinhVienRequest request);
    SinhVienResponse updateProfile(String maSV, SinhVienProfileUpdateRequest request);
    void deleteStudent(String maSV);
}
