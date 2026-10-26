package com.ocr.service;

import com.ocr.dto.request.LopRequest;
import com.ocr.dto.response.LopResponse;
import com.ocr.entity.GiangVien;
import com.ocr.entity.Khoa;
import com.ocr.entity.Lop;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.KhoaRepository;
import com.ocr.repository.LopRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.service.impl.LopServiceImpl;
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
class LopServiceTest {

    @Mock
    private LopRepository lopRepository;

    @Mock
    private KhoaRepository khoaRepository;

    @Mock
    private GiangVienRepository giangVienRepository;

    @Mock
    private SinhVienRepository sinhVienRepository;

    @InjectMocks
    private LopServiceImpl lopService;

    @Test
    @DisplayName("Lấy danh sách Lớp học theo Khoa")
    void testGetAllLop_ByKhoa() {
        Khoa cntt = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        GiangVien gv1 = GiangVien.builder().maGV("GV01").hoTen("TS. Trần Văn An").build();
        Lop lop = Lop.builder().maLop("D24CQCE02-B").tenLop("Kỹ thuật Máy tính 02").khoaHoc(2024).khoa(cntt).coVanHocTap(gv1).build();

        when(lopRepository.findByKhoa_MaKhoa("CNTT")).thenReturn(List.of(lop));

        List<LopResponse> result = lopService.getAllLop("CNTT");

        assertEquals(1, result.size());
        assertEquals("D24CQCE02-B", result.get(0).maLop());
        assertEquals("CNTT", result.get(0).maKhoa());
        assertEquals("GV01", result.get(0).maGVCoVan());
    }

    @Test
    @DisplayName("Tạo mới Lớp học thành công với Cố vấn học tập")
    void testCreateLop_Success() {
        LopRequest req = new LopRequest("D24CQCE02-B", "Kỹ thuật Máy tính 02", 2024, "CNTT", "GV01");
        Khoa cntt = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        GiangVien gv1 = GiangVien.builder().maGV("GV01").hoTen("TS. Trần Văn An").build();
        Lop saved = Lop.builder().maLop("D24CQCE02-B").tenLop("Kỹ thuật Máy tính 02").khoaHoc(2024).khoa(cntt).coVanHocTap(gv1).build();

        when(lopRepository.existsById("D24CQCE02-B")).thenReturn(false);
        when(khoaRepository.findById("CNTT")).thenReturn(Optional.of(cntt));
        when(giangVienRepository.findById("GV01")).thenReturn(Optional.of(gv1));
        when(lopRepository.save(any(Lop.class))).thenReturn(saved);

        LopResponse res = lopService.createLop(req);

        assertNotNull(res);
        assertEquals("D24CQCE02-B", res.maLop());
        assertEquals("CNTT", res.maKhoa());
        assertEquals("GV01", res.maGVCoVan());
        verify(lopRepository, times(1)).save(any(Lop.class));
    }

    @Test
    @DisplayName("Tạo Lớp học trùng mã ném DuplicateResourceException")
    void testCreateLop_DuplicateMaLop() {
        LopRequest req = new LopRequest("D24CQCE02-B", "Kỹ thuật Máy tính 02", 2024, "CNTT", null);
        when(lopRepository.existsById("D24CQCE02-B")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> lopService.createLop(req));
        verify(lopRepository, never()).save(any(Lop.class));
    }
}
