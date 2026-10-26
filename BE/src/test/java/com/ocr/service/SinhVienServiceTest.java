package com.ocr.service;

import com.ocr.dto.request.SinhVienProfileUpdateRequest;
import com.ocr.dto.request.SinhVienRequest;
import com.ocr.dto.response.PageResponse;
import com.ocr.dto.response.SinhVienResponse;
import com.ocr.entity.Khoa;
import com.ocr.entity.Lop;
import com.ocr.entity.SinhVien;
import com.ocr.entity.enums.GioiTinh;
import com.ocr.exception.DuplicateResourceException;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.LopRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.service.impl.SinhVienServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SinhVienServiceTest {

    @Mock
    private SinhVienRepository sinhVienRepository;

    @Mock
    private LopRepository lopRepository;

    @InjectMocks
    private SinhVienServiceImpl sinhVienService;

    @Test
    @DisplayName("Tìm kiếm sinh viên có phân trang và lọc theo Lớp, Khoa")
    void testGetStudents_PaginationAndFilter() {
        Khoa cntt = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        Lop ce02 = Lop.builder().maLop("D24CQCE02-B").tenLop("Kỹ thuật Máy tính 02").khoa(cntt).build();
        SinhVien sv = SinhVien.builder()
                .maSV("B24DCCE001")
                .hoTen("Nguyễn Hoàng Nam")
                .ngaySinh(LocalDate.of(2006, 3, 15))
                .gioiTinh(GioiTinh.NAM)
                .lop(ce02)
                .build();

        Pageable pageable = PageRequest.of(0, 10, Sort.by("maSV").ascending());
        Page<SinhVien> page = new PageImpl<>(List.of(sv), pageable, 1);

        when(sinhVienRepository.searchStudents(eq("Nam"), eq("D24CQCE02-B"), eq("CNTT"), any(Pageable.class)))
                .thenReturn(page);

        PageResponse<SinhVienResponse> result = sinhVienService.getStudents("Nam", "D24CQCE02-B", "CNTT", pageable);

        assertNotNull(result);
        assertEquals(1, result.totalElements());
        assertEquals("B24DCCE001", result.content().get(0).maSV());
        assertEquals("D24CQCE02-B", result.content().get(0).maLop());
        assertEquals("CNTT", result.content().get(0).maKhoa());
    }

    @Test
    @DisplayName("Tạo mới Sinh viên thành công")
    void testCreateStudent_Success() {
        SinhVienRequest req = new SinhVienRequest(
                "B24DCCE001", "Nguyễn Hoàng Nam", LocalDate.of(2006, 3, 15),
                GioiTinh.NAM, "Hà Nội", "nam.nh@qlsv.edu.vn", "0981112233", "D24CQCE02-B"
        );

        Khoa cntt = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        Lop ce02 = Lop.builder().maLop("D24CQCE02-B").tenLop("Kỹ thuật Máy tính 02").khoa(cntt).build();
        SinhVien saved = SinhVien.builder()
                .maSV("B24DCCE001")
                .hoTen("Nguyễn Hoàng Nam")
                .ngaySinh(LocalDate.of(2006, 3, 15))
                .gioiTinh(GioiTinh.NAM)
                .lop(ce02)
                .build();

        when(sinhVienRepository.existsById("B24DCCE001")).thenReturn(false);
        when(sinhVienRepository.existsByEmail("nam.nh@qlsv.edu.vn")).thenReturn(false);
        when(lopRepository.findById("D24CQCE02-B")).thenReturn(Optional.of(ce02));
        when(sinhVienRepository.save(any(SinhVien.class))).thenReturn(saved);

        SinhVienResponse res = sinhVienService.createStudent(req);

        assertNotNull(res);
        assertEquals("B24DCCE001", res.maSV());
        assertEquals("D24CQCE02-B", res.maLop());
        verify(sinhVienRepository, times(1)).save(any(SinhVien.class));
    }

    @Test
    @DisplayName("Tạo Sinh viên trùng mã ném DuplicateResourceException")
    void testCreateStudent_DuplicateMaSV() {
        SinhVienRequest req = new SinhVienRequest(
                "B24DCCE001", "Nguyễn Hoàng Nam", LocalDate.of(2006, 3, 15),
                GioiTinh.NAM, "Hà Nội", null, null, "D24CQCE02-B"
        );
        when(sinhVienRepository.existsById("B24DCCE001")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> sinhVienService.createStudent(req));
        verify(sinhVienRepository, never()).save(any(SinhVien.class));
    }

    @Test
    @DisplayName("Tạo Sinh viên với Mã lớp không tồn tại ném ResourceNotFoundException")
    void testCreateStudent_LopNotFound() {
        SinhVienRequest req = new SinhVienRequest(
                "B24DCCE001", "Nguyễn Hoàng Nam", LocalDate.of(2006, 3, 15),
                GioiTinh.NAM, "Hà Nội", null, null, "UNKNOWN_LOP"
        );
        when(sinhVienRepository.existsById("B24DCCE001")).thenReturn(false);
        when(lopRepository.findById("UNKNOWN_LOP")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> sinhVienService.createStudent(req));
        verify(sinhVienRepository, never()).save(any(SinhVien.class));
    }

    @Test
    @DisplayName("Cập nhật thông tin cá nhân (SĐT, Địa chỉ) - Câu 11")
    void testUpdateProfile_Success() {
        SinhVienProfileUpdateRequest req = new SinhVienProfileUpdateRequest(
                "Đà Nẵng", "0999888777", "nam.new@qlsv.edu.vn"
        );

        Khoa cntt = Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin").build();
        Lop ce02 = Lop.builder().maLop("D24CQCE02-B").tenLop("Kỹ thuật Máy tính 02").khoa(cntt).build();
        SinhVien existing = SinhVien.builder()
                .maSV("B24DCCE001")
                .hoTen("Nguyễn Hoàng Nam")
                .ngaySinh(LocalDate.of(2006, 3, 15))
                .gioiTinh(GioiTinh.NAM)
                .diaChi("Hà Nội")
                .soDienThoai("0981112233")
                .email("nam.old@qlsv.edu.vn")
                .lop(ce02)
                .build();

        when(sinhVienRepository.findById("B24DCCE001")).thenReturn(Optional.of(existing));
        when(sinhVienRepository.existsByEmailAndMaSVNot("nam.new@qlsv.edu.vn", "B24DCCE001")).thenReturn(false);
        when(sinhVienRepository.save(any(SinhVien.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SinhVienResponse res = sinhVienService.updateProfile("B24DCCE001", req);

        assertNotNull(res);
        assertEquals("Đà Nẵng", res.diaChi());
        assertEquals("0999888777", res.soDienThoai());
        assertEquals("nam.new@qlsv.edu.vn", res.email());
        assertEquals("D24CQCE02-B", res.maLop()); // Không đổi mã lớp
    }
}
