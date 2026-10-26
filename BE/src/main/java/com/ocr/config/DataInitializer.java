package com.ocr.config;

import com.ocr.entity.*;
import com.ocr.entity.enums.GioiTinh;
import com.ocr.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final KhoaRepository khoaRepository;
    private final GiangVienRepository giangVienRepository;
    private final LopRepository lopRepository;
    private final SinhVienRepository sinhVienRepository;
    private final MonHocRepository monHocRepository;
    private final HocKyRepository hocKyRepository;
    private final KetQuaRepository ketQuaRepository;

    @Override
    public void run(String... args) {
        seedKhoa();
        seedGiangVien();
        seedLop();
        seedSinhVien();
        seedMonHoc();
        seedHocKy();
        seedKetQua();
    }

    private void seedKhoa() {
        if (khoaRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu mẫu cho KHOA...");
            List<Khoa> khoas = List.of(
                    Khoa.builder().maKhoa("CNTT").tenKhoa("Công nghệ Thông tin 1").build(),
                    Khoa.builder().maKhoa("VT").tenKhoa("Viễn thông 1").build(),
                    Khoa.builder().maKhoa("DTVT").tenKhoa("Điện tử 1").build(),
                    Khoa.builder().maKhoa("ATTT").tenKhoa("An toàn Thông tin").build(),
                    Khoa.builder().maKhoa("CB").tenKhoa("Cơ bản 1").build()
            );
            khoaRepository.saveAll(khoas);
            log.info("Đã nạp {} bản ghi KHOA.", khoas.size());
        }
    }

    private void seedGiangVien() {
        if (giangVienRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu mẫu cho GIANGVIEN...");
            Khoa cntt = khoaRepository.findById("CNTT").orElse(null);
            Khoa vt = khoaRepository.findById("VT").orElse(null);
            Khoa dtvt = khoaRepository.findById("DTVT").orElse(null);

            if (cntt != null && vt != null && dtvt != null) {
                List<GiangVien> giangViens = List.of(
                        GiangVien.builder().maGV("GV01").hoTen("TS. Trần Văn An").email("an.tv@qlsv.edu.vn").soDienThoai("0901234567").khoa(cntt).build(),
                        GiangVien.builder().maGV("GV02").hoTen("ThS. Lê Thị Bình").email("binh.lt@qlsv.edu.vn").soDienThoai("0912345678").khoa(cntt).build(),
                        GiangVien.builder().maGV("GV03").hoTen("PGS.TS. Phạm Quốc Cường").email("cuong.pq@qlsv.edu.vn").soDienThoai("0923456789").khoa(vt).build(),
                        GiangVien.builder().maGV("GV04").hoTen("ThS. Hoàng Đức Duy").email("duy.hd@qlsv.edu.vn").soDienThoai("0934567890").khoa(dtvt).build()
                );
                giangVienRepository.saveAll(giangViens);
                log.info("Đã nạp {} bản ghi GIANGVIEN.", giangViens.size());
            }
        }
    }

    private void seedLop() {
        if (lopRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu mẫu cho LOP...");
            Khoa cntt = khoaRepository.findById("CNTT").orElse(null);
            Khoa vt = khoaRepository.findById("VT").orElse(null);
            Khoa dtvt = khoaRepository.findById("DTVT").orElse(null);
            Khoa attt = khoaRepository.findById("ATTT").orElse(null);

            GiangVien gv01 = giangVienRepository.findById("GV01").orElse(null);
            GiangVien gv02 = giangVienRepository.findById("GV02").orElse(null);
            GiangVien gv03 = giangVienRepository.findById("GV03").orElse(null);
            GiangVien gv04 = giangVienRepository.findById("GV04").orElse(null);

            if (cntt != null && vt != null && dtvt != null && attt != null) {
                List<Lop> lops = List.of(
                        Lop.builder().maLop("D24CQCE02-B").tenLop("Kỹ thuật Máy tính 02 - Khóa 2024").khoaHoc(2024).khoa(cntt).coVanHocTap(gv01).build(),
                        Lop.builder().maLop("D24CQCN01-B").tenLop("Công nghệ Thông tin 01 - Khóa 2024").khoaHoc(2024).khoa(cntt).coVanHocTap(gv02).build(),
                        Lop.builder().maLop("D24CQVT01-B").tenLop("Viễn thông 01 - Khóa 2024").khoaHoc(2024).khoa(vt).coVanHocTap(gv03).build(),
                        Lop.builder().maLop("D24CQDT01-B").tenLop("Điện tử 01 - Khóa 2024").khoaHoc(2024).khoa(dtvt).coVanHocTap(gv04).build(),
                        Lop.builder().maLop("D24CQAT01-B").tenLop("An toàn Thông tin 01 - Khóa 2024").khoaHoc(2024).khoa(attt).coVanHocTap(null).build()
                );
                lopRepository.saveAll(lops);
                log.info("Đã nạp {} bản ghi LOP.", lops.size());
            }
        }
    }

    private void seedSinhVien() {
        if (sinhVienRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu mẫu cho SINHVIEN...");
            Lop ce02 = lopRepository.findById("D24CQCE02-B").orElse(null);
            Lop cn01 = lopRepository.findById("D24CQCN01-B").orElse(null);
            Lop vt01 = lopRepository.findById("D24CQVT01-B").orElse(null);

            if (ce02 != null && cn01 != null && vt01 != null) {
                List<SinhVien> sinhViens = List.of(
                        SinhVien.builder().maSV("B24DCCE001").hoTen("Nguyễn Hoàng Nam").ngaySinh(LocalDate.of(2006, 3, 15)).gioiTinh(GioiTinh.NAM).diaChi("Hà Nội").email("nam.nh@qlsv.edu.vn").soDienThoai("0981112233").lop(ce02).build(),
                        SinhVien.builder().maSV("B24DCCE002").hoTen("Trần Thị Mai Lan").ngaySinh(LocalDate.of(2006, 8, 20)).gioiTinh(GioiTinh.NU).diaChi("Hải Phòng").email("lan.ttm@qlsv.edu.vn").soDienThoai("0982223344").lop(ce02).build(),
                        SinhVien.builder().maSV("B24DCCN001").hoTen("Lê Văn Hùng").ngaySinh(LocalDate.of(2006, 11, 5)).gioiTinh(GioiTinh.NAM).diaChi("Đà Nẵng").email("hung.lv@qlsv.edu.vn").soDienThoai("0983334455").lop(cn01).build(),
                        SinhVien.builder().maSV("B24DCCN002").hoTen("Phạm Thu Thảo").ngaySinh(LocalDate.of(2006, 1, 10)).gioiTinh(GioiTinh.NU).diaChi("Nam Định").email("thao.pt@qlsv.edu.vn").soDienThoai("0984445566").lop(cn01).build(),
                        SinhVien.builder().maSV("B24DCVT001").hoTen("Vũ Đình Khoa").ngaySinh(LocalDate.of(2006, 5, 12)).gioiTinh(GioiTinh.NAM).diaChi("Quảng Ninh").email("khoa.vd@qlsv.edu.vn").soDienThoai("0985556677").lop(vt01).build()
                );
                sinhVienRepository.saveAll(sinhViens);
                log.info("Đã nạp {} bản ghi SINHVIEN.", sinhViens.size());
            }
        }
    }

    private void seedMonHoc() {
        if (monHocRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu mẫu cho MONHOC...");
            List<MonHoc> monHocs = List.of(
                    MonHoc.builder().maMH("INT1313").tenMH("Cơ sở dữ liệu").soTinChi(3).build(),
                    MonHoc.builder().maMH("INT1306").tenMH("Cấu trúc dữ liệu và giải thuật").soTinChi(3).build(),
                    MonHoc.builder().maMH("INT1155").tenMH("Tin học đại cương").soTinChi(3).build(),
                    MonHoc.builder().maMH("BAS1201").tenMH("Đại số tuyến tính").soTinChi(3).build(),
                    MonHoc.builder().maMH("BAS1203").tenMH("Giải tích 1").soTinChi(3).build(),
                    MonHoc.builder().maMH("INT1434").tenMH("Lập trình Web").soTinChi(3).build()
            );
            monHocRepository.saveAll(monHocs);
            log.info("Đã nạp {} bản ghi MONHOC.", monHocs.size());
        }
    }

    private void seedHocKy() {
        if (hocKyRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu mẫu cho HOCKY...");
            List<HocKy> hocKys = List.of(
                    HocKy.builder().maHK("2024-1").namHoc("2024-2025").ky(1).build(),
                    HocKy.builder().maHK("2024-2").namHoc("2024-2025").ky(2).build(),
                    HocKy.builder().maHK("2024-3").namHoc("2024-2025").ky(3).build(),
                    HocKy.builder().maHK("2025-1").namHoc("2025-2026").ky(1).build(),
                    HocKy.builder().maHK("2025-2").namHoc("2025-2026").ky(2).build()
            );
            hocKyRepository.saveAll(hocKys);
            log.info("Đã nạp {} bản ghi HOCKY.", hocKys.size());
        }
    }

    private void seedKetQua() {
        if (ketQuaRepository.count() == 0) {
            log.info("Khởi tạo dữ liệu mẫu cho KETQUA...");
            SinhVien sv1 = sinhVienRepository.findById("B24DCCE001").orElse(null);
            SinhVien sv2 = sinhVienRepository.findById("B24DCCE002").orElse(null);
            SinhVien sv3 = sinhVienRepository.findById("B24DCCN001").orElse(null);

            MonHoc mhCsdl = monHocRepository.findById("INT1313").orElse(null);
            MonHoc mhCtdl = monHocRepository.findById("INT1306").orElse(null);
            MonHoc mhThdc = monHocRepository.findById("INT1155").orElse(null);
            MonHoc mhDaiSo = monHocRepository.findById("BAS1201").orElse(null);

            HocKy hk1 = hocKyRepository.findById("2024-1").orElse(null);

            if (sv1 != null && sv2 != null && sv3 != null && mhCsdl != null && mhCtdl != null && mhDaiSo != null && hk1 != null) {
                KetQua kq1 = new KetQua(sv1, mhCsdl, hk1);
                kq1.setDiemCC(new BigDecimal("9.00"));
                kq1.setDiemGK(new BigDecimal("8.50"));
                kq1.setDiemCK(new BigDecimal("9.00"));

                KetQua kq2 = new KetQua(sv1, mhCtdl, hk1);
                kq2.setDiemCC(new BigDecimal("8.00"));
                kq2.setDiemGK(new BigDecimal("7.00"));
                kq2.setDiemCK(new BigDecimal("8.00"));

                KetQua kq3 = new KetQua(sv1, mhDaiSo, hk1);
                kq3.setDiemCC(new BigDecimal("9.50"));
                kq3.setDiemGK(new BigDecimal("9.00"));
                kq3.setDiemCK(new BigDecimal("9.50"));

                KetQua kq4 = new KetQua(sv2, mhCsdl, hk1);
                kq4.setDiemCC(new BigDecimal("7.00"));
                kq4.setDiemGK(new BigDecimal("6.00"));
                kq4.setDiemCK(new BigDecimal("5.50"));

                KetQua kq5 = new KetQua(sv3, mhCsdl, hk1);
                kq5.setDiemCC(new BigDecimal("8.50"));
                kq5.setDiemGK(new BigDecimal("8.00"));
                kq5.setDiemCK(new BigDecimal("8.50"));

                List<KetQua> ketQuas = List.of(kq1, kq2, kq3, kq4, kq5);
                ketQuaRepository.saveAll(ketQuas);
                log.info("Đã nạp {} bản ghi KETQUA.", ketQuas.size());
            }
        }
    }
}
