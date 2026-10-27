package com.ocr.service.impl;

import com.ocr.dto.response.AvatarUploadResponse;
import com.ocr.entity.GiangVien;
import com.ocr.entity.SinhVien;
import com.ocr.entity.TaiKhoan;
import com.ocr.entity.enums.RoleEnum;
import com.ocr.exception.ResourceNotFoundException;
import com.ocr.repository.GiangVienRepository;
import com.ocr.repository.SinhVienRepository;
import com.ocr.repository.TaiKhoanRepository;
import com.ocr.service.AvatarService;
import com.ocr.service.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AvatarServiceImpl implements AvatarService {

    private final MinioService minioService;
    private final TaiKhoanRepository taiKhoanRepository;
    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;

    @Override
    @Transactional
    public AvatarUploadResponse uploadSelfAvatar(MultipartFile file) {
        TaiKhoan currentAccount = getCurrentAccount();
        String oldAvatar = currentAccount.getAvatarUrl();

        // Xác định prefix phù hợp theo vai trò người dùng
        String prefix = determinePrefix(currentAccount);

        // Upload lên MinIO
        String newAvatarUrl = minioService.uploadAvatar(file, prefix);

        // Cập nhật AvatarUrl vào bảng TAIKHOAN
        currentAccount.setAvatarUrl(newAvatarUrl);
        taiKhoanRepository.save(currentAccount);

        // Đồng bộ vào SINHVIEN hoặc GIANGVIEN nếu tài khoản có liên kết thực thể
        if (currentAccount.getSinhVien() != null) {
            SinhVien sv = currentAccount.getSinhVien();
            sv.setAvatarUrl(newAvatarUrl);
            sinhVienRepository.save(sv);
        } else if (currentAccount.getGiangVien() != null) {
            GiangVien gv = currentAccount.getGiangVien();
            gv.setAvatarUrl(newAvatarUrl);
            giangVienRepository.save(gv);
        }

        // Tự động dọn dẹp file avatar cũ trên MinIO
        if (oldAvatar != null && !oldAvatar.isBlank()) {
            minioService.deleteFile(oldAvatar);
        }

        log.info("Cập nhật avatar cá nhân thành công cho user '{}', role '{}'", currentAccount.getUsername(), currentAccount.getRole());
        return new AvatarUploadResponse(
                newAvatarUrl,
                extractFileName(newAvatarUrl),
                file.getSize(),
                LocalDateTime.now()
        );
    }

    @Override
    @Transactional
    public void deleteSelfAvatar() {
        TaiKhoan currentAccount = getCurrentAccount();
        String oldAvatar = currentAccount.getAvatarUrl();

        if (oldAvatar != null && !oldAvatar.isBlank()) {
            minioService.deleteFile(oldAvatar);
            currentAccount.setAvatarUrl(null);
            taiKhoanRepository.save(currentAccount);

            if (currentAccount.getSinhVien() != null) {
                SinhVien sv = currentAccount.getSinhVien();
                sv.setAvatarUrl(null);
                sinhVienRepository.save(sv);
            } else if (currentAccount.getGiangVien() != null) {
                GiangVien gv = currentAccount.getGiangVien();
                gv.setAvatarUrl(null);
                giangVienRepository.save(gv);
            }
            log.info("Đã xóa avatar cá nhân của user '{}', trở về avatar mặc định", currentAccount.getUsername());
        }
    }

    @Override
    @Transactional
    public AvatarUploadResponse uploadStudentAvatar(String maSV, MultipartFile file) {
        SinhVien sv = sinhVienRepository.findById(maSV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên có mã: " + maSV));

        String oldAvatar = sv.getAvatarUrl();
        String newAvatarUrl = minioService.uploadAvatar(file, "sv_" + maSV);

        sv.setAvatarUrl(newAvatarUrl);
        sinhVienRepository.save(sv);

        // Đồng bộ sang bảng TAIKHOAN của sinh viên (nếu sinh viên đã được cấp tài khoản)
        taiKhoanRepository.findBySinhVien_MaSV(maSV).ifPresent(tk -> {
            tk.setAvatarUrl(newAvatarUrl);
            taiKhoanRepository.save(tk);
        });

        if (oldAvatar != null && !oldAvatar.isBlank()) {
            minioService.deleteFile(oldAvatar);
        }

        log.info("Quản trị viên đã cập nhật ảnh thẻ cho sinh viên '{}'", maSV);
        return new AvatarUploadResponse(
                newAvatarUrl,
                extractFileName(newAvatarUrl),
                file.getSize(),
                LocalDateTime.now()
        );
    }

    @Override
    @Transactional
    public AvatarUploadResponse uploadTeacherAvatar(String maGV, MultipartFile file) {
        GiangVien gv = giangVienRepository.findById(maGV)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên có mã: " + maGV));

        String oldAvatar = gv.getAvatarUrl();
        String newAvatarUrl = minioService.uploadAvatar(file, "gv_" + maGV);

        gv.setAvatarUrl(newAvatarUrl);
        giangVienRepository.save(gv);

        // Đồng bộ sang bảng TAIKHOAN của giảng viên (nếu giảng viên đã được cấp tài khoản)
        taiKhoanRepository.findByGiangVien_MaGV(maGV).ifPresent(tk -> {
            tk.setAvatarUrl(newAvatarUrl);
            taiKhoanRepository.save(tk);
        });

        if (oldAvatar != null && !oldAvatar.isBlank()) {
            minioService.deleteFile(oldAvatar);
        }

        log.info("Quản trị viên đã cập nhật ảnh đại diện cho giảng viên '{}'", maGV);
        return new AvatarUploadResponse(
                newAvatarUrl,
                extractFileName(newAvatarUrl),
                file.getSize(),
                LocalDateTime.now()
        );
    }

    private TaiKhoan getCurrentAccount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResourceNotFoundException("Không xác định được phiên đăng nhập của người dùng.");
        }
        String username = auth.getName();
        return taiKhoanRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin tài khoản người dùng: " + username));
    }

    private String determinePrefix(TaiKhoan account) {
        if (account.getRole() == RoleEnum.ADMIN) {
            return "admin_" + account.getUsername();
        }
        if (account.getRole() == RoleEnum.GIANGVIEN) {
            return "gv_" + (account.getGiangVien() != null ? account.getGiangVien().getMaGV() : account.getUsername());
        }
        if (account.getRole() == RoleEnum.SINHVIEN) {
            return "sv_" + (account.getSinhVien() != null ? account.getSinhVien().getMaSV() : account.getUsername());
        }
        return "user_" + account.getUsername();
    }

    private String extractFileName(String avatarUrl) {
        if (avatarUrl == null || !avatarUrl.contains("/")) {
            return avatarUrl;
        }
        return avatarUrl.substring(avatarUrl.lastIndexOf("/") + 1);
    }
}
