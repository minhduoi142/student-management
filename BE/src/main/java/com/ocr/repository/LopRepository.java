package com.ocr.repository;

import com.ocr.dto.response.SiSoLopResponse;
import com.ocr.entity.Lop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LopRepository extends JpaRepository<Lop, String> {
    List<Lop> findByKhoa_MaKhoa(String maKhoa);
    List<Lop> findByCoVanHocTap_MaGV(String maGV);
    List<Lop> findByKhoaHoc(Integer khoaHoc);
    boolean existsByKhoa_MaKhoa(String maKhoa);

    /**
     * Câu 6: Thống kê số lượng sinh viên theo từng lớp
     */
    @Query("SELECT new com.ocr.dto.response.SiSoLopResponse(l.maLop, l.tenLop, l.khoa.tenKhoa, COUNT(sv)) " +
           "FROM Lop l LEFT JOIN l.sinhViens sv " +
           "GROUP BY l.maLop, l.tenLop, l.khoa.tenKhoa " +
           "ORDER BY COUNT(sv) DESC, l.maLop ASC")
    List<SiSoLopResponse> getThongKeSiSoLop();
}
