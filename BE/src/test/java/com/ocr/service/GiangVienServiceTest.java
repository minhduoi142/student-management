package com.ocr.service;

import com.ocr.dto.request.GiangVienRequest;
import com.ocr.dto.response.GiangVienResponse;
import com.ocr.entity.GiangVien;
import com.ocr.entity.Khoa;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.KhoaRepository;
import com.ocr.repository.LopRepository;
import com.ocr.service.impl.GiangVienServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GiangVienServiceTest {

    @Mock
    private GiangVienRepository giangVienRepository;

    @Mock
    private KhoaRepository khoaRepository;

    @Mock
    private LopRepository lopRepository;

    @InjectMocks
    private GiangVienServiceImpl giangVienService;

    @Test
    @DisplayName("Lấy danh sách Giảng viên theo Khoa")
    void testGetAllGiangVien_ByKhoa() {
        Khoa cntt = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        GiangVien gv1 = GiangVien.builder().maGV("GV01").hoTen("TS. Trần Văn An").khoa(cntt).build();

        when(giangVienRepository.findByKhoa_MaKhoa("CNTT")).thenReturn(List.of(gv1));

        List<GiangVienResponse> result = giangVienService.getAllGiangVien("CNTT");

        assertEquals(1, result.size());
        assertEquals("GV01", result.get(0).maGV());
        assertEquals("CNTT", result.get(0).maKhoa());
    }

    @Test
    @DisplayName("Tạo mới Giảng viên thành công")
    void testCreateGiangVien_Success() {
        GiangVienRequest req = new GiangVienRequest("GV01", "TS. Trần Văn An", "an.tv@qlsv.edu.vn", "0901234567", "CNTT");
        Khoa cntt = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        GiangVien saved = GiangVien.builder().maGV("GV01").hoTen("TS. Trần Văn An").email("an.tv@qlsv.edu.vn").khoa(cntt).build();

        when(giangVienRepository.existsById("GV01")).thenReturn(false);
        when(giangVienRepository.existsByEmail("an.tv@qlsv.edu.vn")).thenReturn(false);
        when(khoaRepository.findById("CNTT")).thenReturn(Optional.of(cntt));
        when(giangVienRepository.save(any(GiangVien.class))).thenReturn(saved);

        GiangVienResponse res = giangVienService.createGiangVien(req);

        assertNotNull(res);
        assertEquals("GV01", res.maGV());
        assertEquals("CNTT", res.maKhoa());
        verify(giangVienRepository, times(1)).save(any(GiangVien.class));
    }

    @Test
    @DisplayName("Tạo Giảng viên khi Mã khoa không tồn tại ném ResourceNotFoundException")
    void testCreateGiangVien_KhoaNotFound() {
        GiangVienRequest req = new GiangVienRequest("GV01", "TS. Trần Văn An", "an.tv@qlsv.edu.vn", "0901234567", "UNKNOWN");

        when(giangVienRepository.existsById("GV01")).thenReturn(false);
        when(giangVienRepository.existsByEmail("an.tv@qlsv.edu.vn")).thenReturn(false);
        when(khoaRepository.findById("UNKNOWN")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> giangVienService.createGiangVien(req));
        verify(giangVienRepository, never()).save(any(GiangVien.class));
    }

    @Test
    @DisplayName("Tạo Giảng viên trùng mã ném DuplicateResourceException")
    void testCreateGiangVien_DuplicateMaGV() {
        GiangVienRequest req = new GiangVienRequest("GV01", "TS. Trần Văn An", "an.tv@qlsv.edu.vn", "0901234567", "CNTT");
        when(giangVienRepository.existsById("GV01")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> giangVienService.createGiangVien(req));
        verify(giangVienRepository, never()).save(any(GiangVien.class));
    }
}
