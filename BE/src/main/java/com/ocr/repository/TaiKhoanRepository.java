package com.ocr.repository;

import com.ocr.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {

    Optional<TaiKhoan> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsBySinhVien_MaSV(String maSV);

    boolean existsByGiangVien_MaGV(String maGV);

    @Query("SELECT COUNT(t) > 0 FROM TaiKhoan t WHERE t.sinhVien.maSV = :maSV")
    boolean existsByMaSV(@Param("maSV") String maSV);

    @Query("SELECT COUNT(t) > 0 FROM TaiKhoan t WHERE t.giangVien.maGV = :maGV")
    boolean existsByMaGV(@Param("maGV") String maGV);

    Optional<TaiKhoan> findBySinhVien_MaSV(String maSV);

    Optional<TaiKhoan> findByGiangVien_MaGV(String maGV);
}
