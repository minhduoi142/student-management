import apiClient from "@/lib/api-client"
import type { BangDiemSinhVienResponse, KetQuaRequest, KetQuaResponse } from "./types"

export const gradeService = {
  /**
   * Nhập hoặc cập nhật điểm học phần cho sinh viên
   */
  async saveOrUpdate(data: KetQuaRequest): Promise<KetQuaResponse> {
    return apiClient.post<never, KetQuaResponse>("/diem", data)
  },

  /**
   * Xóa một bản ghi điểm theo bộ ba khóa (MaSV, MaMH, MaHK)
   */
  async delete(maSV: string, maMH: string, maHK: string): Promise<{ _message?: string }> {
    return apiClient.delete<never, { _message?: string }>("/diem", {
      params: { maSV, maMH, maHK },
    })
  },

  /**
   * Tra cứu toàn bộ bảng điểm của một sinh viên (hỗ trợ lọc theo học kỳ)
   */
  async getBangDiem(maSV: string, maHK?: string): Promise<BangDiemSinhVienResponse> {
    const params: Record<string, string> = {}
    if (maHK && maHK !== "all") params.maHK = maHK

    return apiClient.get<never, BangDiemSinhVienResponse>(
      `/diem/sinh-vien/${encodeURIComponent(maSV)}`,
      { params }
    )
  },

  /**
   * Tra cứu danh sách điểm sinh viên theo môn học (hỗ trợ lọc theo học kỳ)
   */
  async getByMonHoc(maMH: string, maHK?: string): Promise<KetQuaResponse[]> {
    const params: Record<string, string> = {}
    if (maHK && maHK !== "all") params.maHK = maHK

    return apiClient.get<never, KetQuaResponse[]>(
      `/diem/mon-hoc/${encodeURIComponent(maMH)}`,
      { params }
    )
  },
}
