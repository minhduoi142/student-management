package com.ocr.repository;

import com.ocr.entity.Khoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhoaRepository extends JpaRepository<Khoa, String> {
    Optional<Khoa> findByTenKhoa(String tenKhoa);
    boolean existsByTenKhoa(String tenKhoa);
    boolean existsByTenKhoaAndMaKhoaNot(String tenKhoa, String maKhoa);
}
