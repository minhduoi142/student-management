package com.ocr.repository;

import com.ocr.entity.MonHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MonHocRepository extends JpaRepository<MonHoc, String> {
    List<MonHoc> findByTenMHContainingIgnoreCase(String tenMH);
    boolean existsByTenMH(String tenMH);
    boolean existsByTenMHAndMaMHNot(String tenMH, String maMH);

    /**
     * Câu 15: Tìm môn học chưa có sinh viên nào có kết quả
     */
    @org.springframework.data.jpa.repository.Query("SELECT mh FROM MonHoc mh WHERE mh.ketQuas IS EMPTY ORDER BY mh.maMH ASC")
    List<MonHoc> findMonHocChuaCoKetQua();
}
