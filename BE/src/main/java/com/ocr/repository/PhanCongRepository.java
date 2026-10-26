package com.ocr.repository;

import com.ocr.entity.PhanCong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhanCongRepository extends JpaRepository<PhanCong, Long> {

    /**
     * Kiểm tra Giảng viên có được phân công giảng dạy môn học cho lớp trong học kỳ cụ thể hay không
     * (Căn cứ phân quyền nhập điểm)
     */
    boolean existsByGiangVien_MaGVAndMonHoc_MaMHAndLop_MaLopAndHocKy_MaHK(
        String maGV,
        String maMH,
        String maLop,
        String maHK
    );

    /**
     * Tìm kiếm phân công duy nhất theo tổ hợp (Môn học, Lớp, Học kỳ)
     */
    Optional<PhanCong> findByMonHoc_MaMHAndLop_MaLopAndHocKy_MaHK(
        String maMH,
        String maLop,
        String maHK
    );

    /**
     * Danh sách phân công của một Giảng viên
     */
    List<PhanCong> findByGiangVien_MaGV(String maGV);

    /**
     * Danh sách phân công của một Giảng viên trong một Học kỳ
     */
    List<PhanCong> findByGiangVien_MaGVAndHocKy_MaHK(String maGV, String maHK);

    /**
     * Danh sách phân công cho một Lớp
     */
    List<PhanCong> findByLop_MaLop(String maLop);

    /**
     * Danh sách phân công trong một Học kỳ
     */
    List<PhanCong> findByHocKy_MaHK(String maHK);
}
