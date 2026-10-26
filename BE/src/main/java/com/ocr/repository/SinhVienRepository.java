package com.ocr.repository;

import com.ocr.entity.SinhVien;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, String> {

    Optional<SinhVien> findByEmail(String email);

    List<SinhVien> findByLop_MaLop(String maLop);

    List<SinhVien> findByHoTenContainingIgnoreCase(String hoTen);

    boolean existsByEmail(String email);

    boolean existsByEmailAndMaSVNot(String email, String maSV);

    boolean existsByLop_MaLop(String maLop);

    /**
     * Tìm kiếm sinh viên có phân trang, hỗ trợ tìm theo Tên / Mã SV, lọc theo Lớp và lọc theo Khoa
     */
    @Query("SELECT sv FROM SinhVien sv " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(sv.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(sv.maSV) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:maLop IS NULL OR :maLop = '' OR sv.lop.maLop = :maLop) " +
           "AND (:maKhoa IS NULL OR :maKhoa = '' OR sv.lop.khoa.maKhoa = :maKhoa)")
    Page<SinhVien> searchStudents(
        @Param("keyword") String keyword,
        @Param("maLop") String maLop,
        @Param("maKhoa") String maKhoa,
        Pageable pageable
    );

    /**
     * Câu 9: Liệt kê sinh viên chưa có bản ghi kết quả nào (nợ bảng điểm)
     */
    @Query("SELECT sv FROM SinhVien sv " +
           "WHERE sv.ketQuas IS EMPTY " +
           "ORDER BY sv.lop.maLop ASC, sv.maSV ASC")
    List<SinhVien> findSinhVienChuaCoDiem();
}
