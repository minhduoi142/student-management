package com.ocr.security;

import com.ocr.entity.TaiKhoan;
import com.ocr.entity.enums.RoleEnum;
import com.ocr.repository.PhanCongRepository;
import com.ocr.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final PhanCongRepository phanCongRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    /**
     * Kiểm tra Giảng viên có quyền nhập/sửa điểm cho môn học, lớp học và học kỳ tương ứng hay không.
     * Căn cứ vào bảng PHANCONG trong cơ sở dữ liệu.
     *
     * @param teacherIdentifier Username hoặc Mã giảng viên (MaGV)
     * @param maMH              Mã môn học
     * @param maLop             Mã lớp (nếu null thì kiểm tra phân công theo môn và kỳ)
     * @param maHK              Mã học kỳ
     * @return true nếu giảng viên được phân công giảng dạy, ngược lại false
     */
    public boolean canTeacherGrade(String teacherIdentifier, String maMH, String maLop, String maHK) {
        if (teacherIdentifier == null || teacherIdentifier.isBlank()) {
            return false;
        }

        // Tìm mã GV thực tế: có thể truyền vào là username hoặc trực tiếp là maGV
        String effectiveMaGV = null;
        Optional<TaiKhoan> userOpt = taiKhoanRepository.findByUsername(teacherIdentifier.trim());
        if (userOpt.isPresent()) {
            TaiKhoan taiKhoan = userOpt.get();
            // Nếu là ADMIN thì luôn có quyền
            if (taiKhoan.getRole() == RoleEnum.ADMIN) {
                return true;
            }
            if (taiKhoan.getGiangVien() != null) {
                effectiveMaGV = taiKhoan.getGiangVien().getMaGV();
            }
        } else {
            // Không tìm thấy username, thử coi teacherIdentifier chính là MaGV
            effectiveMaGV = teacherIdentifier.trim();
        }

        if (effectiveMaGV == null || maMH == null || maHK == null) {
            log.warn("Không xác định được thông tin kiểm tra phân công: maGV={}, maMH={}, maHK={}", effectiveMaGV, maMH, maHK);
            return false;
        }

        if (maLop != null && !maLop.isBlank()) {
            boolean hasPermission = phanCongRepository.existsByGiangVien_MaGVAndMonHoc_MaMHAndLop_MaLopAndHocKy_MaHK(
                    effectiveMaGV.trim(),
                    maMH.trim(),
                    maLop.trim(),
                    maHK.trim()
            );
            log.debug("Kiểm tra phân công [GV: {}, MH: {}, Lớp: {}, HK: {}] -> {}", effectiveMaGV, maMH, maLop, maHK, hasPermission);
            return hasPermission;
        } else {
            // Nếu không truyền mã lớp, kiểm tra giảng viên có dạy môn này trong học kỳ này hay không
            boolean hasPermission = phanCongRepository.findByGiangVien_MaGVAndHocKy_MaHK(effectiveMaGV.trim(), maHK.trim())
                    .stream()
                    .anyMatch(pc -> pc.getMonHoc() != null && pc.getMonHoc().getMaMH().equalsIgnoreCase(maMH.trim()));
            log.debug("Kiểm tra phân công không có mã lớp [GV: {}, MH: {}, HK: {}] -> {}", effectiveMaGV, maMH, maHK, hasPermission);
            return hasPermission;
        }
    }

    /**
     * Kiểm tra Sinh viên chỉ được phép tra cứu bảng điểm của chính mình.
     * So sánh maSV trong token với maSV trong request path.
     *
     * @param maSV Mã sinh viên cần tra cứu
     * @return true nếu người dùng là chủ sở hữu hoặc có quyền xem (ADMIN, GIANGVIEN)
     */
    public boolean isStudentOwner(String maSV) {
        if (maSV == null || maSV.isBlank()) {
            return false;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Nếu người dùng có quyền ADMIN hoặc GIANGVIEN thì cho phép
        boolean isStaffOrAdmin = authentication.getAuthorities().stream().anyMatch(auth ->
                auth.getAuthority().equals("ROLE_ADMIN") ||
                auth.getAuthority().equals("ADMIN") ||
                auth.getAuthority().equals("ROLE_GIANGVIEN") ||
                auth.getAuthority().equals("GIANGVIEN")
        );
        if (isStaffOrAdmin) {
            return true;
        }

        // Lấy maSV từ principal nếu là CustomUserDetails
        if (authentication.getPrincipal() instanceof CustomUserDetails userDetails) {
            if (userDetails.getRole() == RoleEnum.ADMIN || userDetails.getRole() == RoleEnum.GIANGVIEN) {
                return true;
            }
            if (userDetails.getMaSV() != null) {
                return userDetails.getMaSV().equalsIgnoreCase(maSV.trim());
            }
        }

        // Tra cứu cơ sở dữ liệu qua username nếu principal là chuỗi username thông thường
        String username = authentication.getName();
        Optional<TaiKhoan> userOpt = taiKhoanRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            TaiKhoan taiKhoan = userOpt.get();
            if (taiKhoan.getRole() == RoleEnum.ADMIN || taiKhoan.getRole() == RoleEnum.GIANGVIEN) {
                return true;
            }
            if (taiKhoan.getSinhVien() != null) {
                return taiKhoan.getSinhVien().getMaSV().equalsIgnoreCase(maSV.trim());
            }
        }

        return false;
    }
}
