package com.ocr.service;

import com.ocr.dto.response.*;
import com.ocr.entity.KetQua;
import com.ocr.entity.MonHoc;
import com.ocr.entity.SinhVien;
import com.ocr.repository.*;
import com.ocr.service.impl.ThongKeServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThongKeServiceTest {

    @Mock
    private KhoaRepository khoaRepository;

    @Mock
    private GiangVienRepository giangVienRepository;

    @Mock
    private LopRepository lopRepository;

    @Mock
    private SinhVienRepository sinhVienRepository;

    @Mock
    private MonHocRepository monHocRepository;

    @Mock
    private HocKyRepository hocKyRepository;

    @Mock
    private KetQuaRepository ketQuaRepository;

    @InjectMocks
    private ThongKeServiceImpl thongKeService;

    @Test
    @DisplayName("Câu 6: Thống kê sĩ số sinh viên theo từng lớp")
    void testGetSiSoLop() {
        SiSoLopResponse r1 = new SiSoLopResponse("D24CQCE02-B", "Kỹ thuật Máy tính 02", "CNTT", 2L);
        when(lopRepository.getThongKeSiSoLop()).thenReturn(List.of(r1));

        List<SiSoLopResponse> list = thongKeService.getSiSoLop();

        assertEquals(1, list.size());
        assertEquals("D24CQCE02-B", list.get(0).maLop());
        assertEquals(2L, list.get(0).siSo());
    }

    @Test
    @DisplayName("Câu 7: Tính điểm cuối kỳ trung bình của từng môn học")
    void testGetDiemTrungBinhMon() {
        Object[] row = new Object[]{"INT1313", "Cơ sở dữ liệu", 3, 8.50, 3L};
        when(ketQuaRepository.getDiemCKTrungBinhTungMonRaw()).thenReturn(java.util.Collections.singletonList(row));

        List<DiemTrungBinhMonResponse> list = thongKeService.getDiemTrungBinhMon();

        assertEquals(1, list.size());
        assertEquals("INT1313", list.get(0).maMH());
        assertEquals(new BigDecimal("8.50"), list.get(0).diemCKTrungBinh());
        assertEquals(3L, list.get(0).soLuongSinhVien());
    }

    @Test
    @DisplayName("Câu 8: Tìm sinh viên có điểm cuối kỳ >= 8.0")
    void testGetSinhVienDiemCao() {
        SinhVien sv = SinhVien.builder().maSV("B24DCCE001").hoTen("Nguyễn Hoàng Nam").build();
        MonHoc mh = MonHoc.builder().maMH("INT1313").tenMH("Cơ sở dữ liệu").build();
        KetQua kq = new KetQua(sv, mh, null);
        kq.setDiemCC(new BigDecimal("9.00"));
        kq.setDiemGK(new BigDecimal("8.50"));
        kq.setDiemCK(new BigDecimal("9.00"));

        when(monHocRepository.existsById("INT1313")).thenReturn(true);
        when(ketQuaRepository.findSinhVienDiemCaoTheoMon("INT1313", new BigDecimal("8.00"))).thenReturn(List.of(kq));

        List<SinhVienDiemGioiResponse> list = thongKeService.getSinhVienDiemCao("INT1313", new BigDecimal("8.00"));

        assertEquals(1, list.size());
        assertEquals("B24DCCE001", list.get(0).maSV());
        assertEquals(new BigDecimal("9.00"), list.get(0).diemCK());
    }

    @Test
    @DisplayName("Câu 9: Liệt kê sinh viên chưa có điểm nào")
    void testGetSinhVienChuaCoDiem() {
        SinhVien sv = SinhVien.builder().maSV("B24DCVT001").hoTen("Vũ Đình Khoa").build();
        when(sinhVienRepository.findSinhVienChuaCoDiem()).thenReturn(List.of(sv));

        List<SinhVienResponse> list = thongKeService.getSinhVienChuaCoDiem();

        assertEquals(1, list.size());
        assertEquals("B24DCVT001", list.get(0).maSV());
    }

    @Test
    @DisplayName("Câu 10: Thống kê số lượng kết quả theo từng học kỳ")
    void testGetThongKeSoLuongKetQuaTheoHocKy() {
        Object[] row = new Object[]{"2024-1", "2024-2025", 1, 5L};
        when(ketQuaRepository.getThongKeSoLuongKetQuaTheoHocKyRaw()).thenReturn(java.util.Collections.singletonList(row));

        List<ThongKeHocKyResponse> list = thongKeService.getThongKeSoLuongKetQuaTheoHocKy();

        assertEquals(1, list.size());
        assertEquals("2024-1", list.get(0).maHK());
        assertEquals(5L, list.get(0).soLuongKetQua());
    }

    @Test
    @DisplayName("Câu 15: Tìm môn học chưa có sinh viên nào có kết quả")
    void testGetMonHocChuaCoKetQua() {
        MonHoc mh = MonHoc.builder().maMH("BAS1203").tenMH("Giải tích 1").soTinChi(3).build();
        when(monHocRepository.findMonHocChuaCoKetQua()).thenReturn(List.of(mh));

        List<MonHocResponse> list = thongKeService.getMonHocChuaCoKetQua();

        assertEquals(1, list.size());
        assertEquals("BAS1203", list.get(0).maMH());
    }

    @Test
    @DisplayName("Dashboard: Tổng quan số liệu toàn hệ thống")
    void testGetDashboardOverview() {
        when(khoaRepository.count()).thenReturn(5L);
        when(giangVienRepository.count()).thenReturn(4L);
        when(lopRepository.count()).thenReturn(5L);
        when(sinhVienRepository.count()).thenReturn(5L);
        when(monHocRepository.count()).thenReturn(6L);
        when(hocKyRepository.count()).thenReturn(5L);
        when(ketQuaRepository.count()).thenReturn(5L);

        DashboardOverviewResponse res = thongKeService.getDashboardOverview();

        assertNotNull(res);
        assertEquals(5L, res.tongSoKhoa());
        assertEquals(4L, res.tongSoGiangVien());
        assertEquals(5L, res.tongSoSinhVien());
        assertEquals(6L, res.tongSoMonHoc());
    }
}
