package com.ocr.repository;

import com.ocr.entity.GiangVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GiangVienRepository extends JpaRepository<GiangVien, String> {
    Optional<GiangVien> findByEmail(String email);
    List<GiangVien> findByKhoa_MaKhoa(String maKhoa);
    boolean existsByEmail(String email);
    boolean existsByEmailAndMaGVNot(String email, String maGV);
    boolean existsByKhoa_MaKhoa(String maKhoa);
}
