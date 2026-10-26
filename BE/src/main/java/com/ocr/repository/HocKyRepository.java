package com.ocr.repository;

import com.ocr.entity.HocKy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HocKyRepository extends JpaRepository<HocKy, String> {
    Optional<HocKy> findByNamHocAndKy(String namHoc, Integer ky);
    List<HocKy> findByNamHoc(String namHoc);
    boolean existsByNamHocAndKy(String namHoc, Integer ky);
    boolean existsByNamHocAndKyAndMaHKNot(String namHoc, Integer ky, String maHK);
}
