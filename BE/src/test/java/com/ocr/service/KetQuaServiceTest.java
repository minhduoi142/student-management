package com.ocr.service;

import com.ocr.dto.request.KetQuaRequest;
import com.ocr.dto.response.BangDiemSinhVienResponse;
import com.ocr.dto.response.KetQuaResponse;
import com.ocr.entity.HocKy;
import com.ocr.entity.KetQua;
import com.ocr.entity.MonHoc;
import com.ocr.entity.SinhVien;
import com.ocr.entity.id.KetQuaId;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.HocKyRepository;
import com.ocr.repository.KetQuaRepository;
import com.ocr.repository.MonHocRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.service.impl.KetQuaServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KetQuaServiceTest {

    @Mock
    private KetQuaRepository ketQuaRepository;

    @Mock
    private SinhVienRepository sinhVienRepository;

    @Mock
    private MonHocRepository monHocRepository;

    @Mock
    private HocKyRepository hocKyRepository;

    @InjectMocks
    private KetQuaServiceImpl ketQuaService;

    @Test
    @DisplayName("Nhập điểm mới và tự động tính điểm tổng kết: CC*0.1 + GK*0.3 + CK*0.6")
    void testSaveOrUpdateDiem_Success() {
        SinhVien sv = SinhVien.builder().maSV("B24DCCE001").hoTen("Nguyễn Hoàng Nam").build();
        MonHoc mh = MonHoc.builder().maMH("INT1313").tenMH("Cơ sở dữ liệu").soTinChi(3).build();
        HocKy hk = HocKy.builder().maHK("2024-1").namHoc("2024-2025").ky(1).build();

        KetQuaRequest req = new KetQuaRequest(
                "B24DCCE001", "INT1313", "2024-1",
                new BigDecimal("9.00"), new BigDecimal("8.50"), new BigDecimal("9.00")
        );

        when(sinhVienRepository.findById("B24DCCE001")).thenReturn(Optional.of(sv));
        when(monHocRepository.findById("INT1313")).thenReturn(Optional.of(mh));
        when(hocKyRepository.findById("2024-1")).thenReturn(Optional.of(hk));
        when(ketQuaRepository.findById(any(KetQuaId.class))).thenReturn(Optional.empty());

        when(ketQuaRepository.save(any(KetQua.class))).thenAnswer(invocation -> invocation.getArgument(0));

        KetQuaResponse res = ketQuaService.saveOrUpdateDiem(req);

        assertNotNull(res);
        assertEquals("B24DCCE001", res.maSV());
        assertEquals("INT1313", res.maMH());
        assertEquals("2024-1", res.maHK());

        // Kiểm tra công thức: 9.0*0.1 + 8.5*0.3 + 9.0*0.6 = 0.9 + 2.55 + 5.4 = 8.85
        assertEquals(new BigDecimal("8.85"), res.diemTongKet());
        assertEquals("Đạt", res.danhGia());
        verify(ketQuaRepository, times(1)).save(any(KetQua.class));
    }

    @Test
    @DisplayName("Nhập điểm khi Sinh viên không tồn tại ném ResourceNotFoundException")
    void testSaveOrUpdateDiem_SinhVienNotFound() {
        KetQuaRequest req = new KetQuaRequest(
                "UNKNOWN", "INT1313", "2024-1",
                new BigDecimal("9.00"), new BigDecimal("8.00"), new BigDecimal("8.00")
        );

        when(sinhVienRepository.findById("UNKNOWN")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> ketQuaService.saveOrUpdateDiem(req));
        verify(ketQuaRepository, never()).save(any(KetQua.class));
    }

    @Test
    @DisplayName("Tra cứu bảng điểm sinh viên và tính tích lũy tín chỉ, GPA hệ 10")
    void testGetBangDiemSinhVien_Success() {
        SinhVien sv = SinhVien.builder().maSV("B24DCCE001").hoTen("Nguyễn Hoàng Nam").build();
        MonHoc mh1 = MonHoc.builder().maMH("INT1313").tenMH("Cơ sở dữ liệu").soTinChi(3).build();
        MonHoc mh2 = MonHoc.builder().maMH("INT1306").tenMH("Cấu trúc dữ liệu").soTinChi(3).build();
        HocKy hk = HocKy.builder().maHK("2024-1").namHoc("2024-2025").ky(1).build();

        KetQua kq1 = new KetQua(sv, mh1, hk);
        kq1.setDiemCC(new BigDecimal("9.00"));
        kq1.setDiemGK(new BigDecimal("8.50"));
        kq1.setDiemCK(new BigDecimal("9.00")); // Tổng: 8.85

        KetQua kq2 = new KetQua(sv, mh2, hk);
        kq2.setDiemCC(new BigDecimal("8.00"));
        kq2.setDiemGK(new BigDecimal("7.00"));
        kq2.setDiemCK(new BigDecimal("8.00")); // Tổng: 7.70

        when(sinhVienRepository.findById("B24DCCE001")).thenReturn(Optional.of(sv));
        when(ketQuaRepository.findById_MaSV("B24DCCE001")).thenReturn(List.of(kq1, kq2));

        BangDiemSinhVienResponse res = ketQuaService.getBangDiemSinhVien("B24DCCE001", null);

        assertNotNull(res);
        assertEquals(2, res.danhSachDiem().size());
        assertEquals(6, res.tongTinChiTichLuy()); // 3 + 3 = 6
        // Trung bình: (8.85*3 + 7.70*3) / 6 = (26.55 + 23.10) / 6 = 49.65 / 6 = 8.28
        assertEquals(new BigDecimal("8.28"), res.diemTrungBinhTichLuy());
    }

    @Test
    @DisplayName("Xóa bản ghi điểm thành công")
    void testDeleteDiem_Success() {
        KetQuaId id = new KetQuaId("B24DCCE001", "INT1313", "2024-1");
        when(ketQuaRepository.existsById(id)).thenReturn(true);

        ketQuaService.deleteDiem("B24DCCE001", "INT1313", "2024-1");

        verify(ketQuaRepository, times(1)).deleteById(id);
    }
}
