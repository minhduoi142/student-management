package com.ocr.service;

import com.ocr.dto.request.KhoaRequest;
import com.ocr.dto.response.KhoaResponse;
import com.ocr.entity.Khoa;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.KhoaRepository;
import com.ocr.repository.LopRepository;
import com.ocr.service.impl.KhoaServiceImpl;
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
class KhoaServiceTest {

    @Mock
    private KhoaRepository khoaRepository;

    @Mock
    private GiangVienRepository giangVienRepository;

    @Mock
    private LopRepository lopRepository;

    @InjectMocks
    private KhoaServiceImpl khoaService;

    @Test
    @DisplayName("Lấy danh sách tất cả Khoa")
    void testGetAllKhoa() {
        Khoa k1 = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        Khoa k2 = Khoa.builder().maKhoa("VT").tenKhoa("Viễn thông").build();

        when(khoaRepository.findAll()).thenReturn(List.of(k1, k2));

        List<KhoaResponse> result = khoaService.getAllKhoa();

        assertEquals(2, result.size());
        assertEquals("CNTT", result.get(0).maKhoa());
        assertEquals("VT", result.get(1).maKhoa());
    }

    @Test
    @DisplayName("Tìm Khoa theo mã thành công")
    void testGetKhoaById_Success() {
        Khoa k = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        when(khoaRepository.findById("CNTT")).thenReturn(Optional.of(k));

        KhoaResponse response = khoaService.getKhoaById("CNTT");

        assertNotNull(response);
        assertEquals("CNTT", response.maKhoa());
        assertEquals("Công nghệ Thông tin", response.tenKhoa());
    }

    @Test
    @DisplayName("Tìm Khoa không tồn tại ném ResourceNotFoundException")
    void testGetKhoaById_NotFound() {
        when(khoaRepository.findById("XYZ")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> khoaService.getKhoaById("XYZ"));
    }

    @Test
    @DisplayName("Tạo mới Khoa thành công")
    void testCreateKhoa_Success() {
        KhoaRequest req = new KhoaRequest("CNTT", "Công nghệ Thông tin");
        Khoa saved = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();

        when(khoaRepository.existsById("CNTT")).thenReturn(false);
        when(khoaRepository.existsByTenKhoa("Công nghệ Thông tin")).thenReturn(false);
        when(khoaRepository.save(any(Khoa.class))).thenReturn(saved);

        KhoaResponse res = khoaService.createKhoa(req);

        assertNotNull(res);
        assertEquals("CNTT", res.maKhoa());
        verify(khoaRepository, times(1)).save(any(Khoa.class));
    }

    @Test
    @DisplayName("Tạo Khoa trùng mã ném DuplicateResourceException")
    void testCreateKhoa_DuplicateCode() {
        KhoaRequest req = new KhoaRequest("CNTT", "Công nghệ Thông tin");
        when(khoaRepository.existsById("CNTT")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> khoaService.createKhoa(req));
        verify(khoaRepository, never()).save(any(Khoa.class));
    }
}
