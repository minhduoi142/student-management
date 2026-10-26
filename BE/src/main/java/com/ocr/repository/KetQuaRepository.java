package com.ocr.repository;

import com.ocr.entity.KetQua;
import com.ocr.entity.id.KetQuaId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface KetQuaRepository extends JpaRepository<KetQua, KetQuaId> {

    List<KetQua> findById_MaSV(String maSV);

    List<KetQua> findById_MaMH(String maMH);

    List<KetQua> findById_MaHK(String maHK);

    List<KetQua> findById_MaSVAndId_MaHK(String maSV, String maHK);

    List<KetQua> findById_MaMHAndId_MaHK(String maMH, String maHK);

    boolean existsById_MaMH(String maMH);

    boolean existsById_MaHK(String maHK);

    /**
     * Câu 7: Tính điểm cuối kỳ trung bình của từng môn học
     */
    @Query("SELECT kq.monHoc.maMH, kq.monHoc.tenMH, kq.monHoc.soTinChi, AVG(kq.diemCK), COUNT(kq) " +
           "FROM KetQua kq " +
           "WHERE kq.diemCK IS NOT NULL " +
           "GROUP BY kq.monHoc.maMH, kq.monHoc.tenMH, kq.monHoc.soTinChi " +
           "ORDER BY AVG(kq.diemCK) DESC")
    List<Object[]> getDiemCKTrungBinhTungMonRaw();

    /**
     * Câu 8: Tìm sinh viên có điểm cuối kỳ >= minDiemCK (mặc định 8.0) ở một môn cụ thể
     */
    @Query("SELECT kq FROM KetQua kq " +
           "WHERE kq.monHoc.maMH = :maMH AND kq.diemCK >= :minDiemCK " +
           "ORDER BY kq.diemCK DESC, kq.sinhVien.maSV ASC")
    List<KetQua> findSinhVienDiemCaoTheoMon(
        @Param("maMH") String maMH,
        @Param("minDiemCK") BigDecimal minDiemCK
    );

    /**
     * Câu 10: Thống kê số lượng bản ghi kết quả theo từng học kỳ
     */
    @Query("SELECT hk.maHK, hk.namHoc, hk.ky, COUNT(kq) " +
           "FROM HocKy hk LEFT JOIN hk.ketQuas kq " +
           "GROUP BY hk.maHK, hk.namHoc, hk.ky " +
           "ORDER BY hk.namHoc ASC, hk.ky ASC")
    List<Object[]> getThongKeSoLuongKetQuaTheoHocKyRaw();
}
