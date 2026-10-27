import apiClient from "@/lib/api-client"
import { authService } from "./auth.service"
import type { AvatarUploadResponse } from "./types"

export const fileService = {
  /**
   * Người dùng hiện tại tự tải lên hoặc thay đổi avatar
   */
  uploadSelfAvatar: async (file: File): Promise<AvatarUploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await apiClient.post<any, AvatarUploadResponse>("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    if (res?.avatarUrl) {
      authService.updateCurrentUserAvatar(res.avatarUrl)
    }

    return res
  },

  /**
   * Xóa ảnh đại diện cá nhân, đưa về mặc định
   */
  deleteSelfAvatar: async (): Promise<void> => {
    await apiClient.delete<any, void>("/users/avatar")
    authService.updateCurrentUserAvatar(null)
  },

  /**
   * Quản trị viên cập nhật ảnh thẻ cho sinh viên theo mã SV
   */
  uploadStudentAvatar: async (maSV: string, file: File): Promise<AvatarUploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    return apiClient.post<any, AvatarUploadResponse>(`/sinh-vien/${encodeURIComponent(maSV)}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },

  /**
   * Quản trị viên cập nhật ảnh đại diện cho giảng viên theo mã GV
   */
  uploadTeacherAvatar: async (maGV: string, file: File): Promise<AvatarUploadResponse> => {
    const formData = new FormData()
    formData.append("file", file)

    return apiClient.post<any, AvatarUploadResponse>(`/giang-vien/${encodeURIComponent(maGV)}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}
