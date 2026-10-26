import apiClient from "@/lib/api-client"
import type {
  GetStudentsQuery,
  PageResponse,
  SinhVienProfileUpdateRequest,
  SinhVienRequest,
  SinhVienResponse,
} from "./types"

export const studentService = {
  /**
   * Lấy danh sách sinh viên có phân trang, tìm kiếm theo từ khóa và lọc theo khoa / lớp
   */
  async getStudents(params?: GetStudentsQuery): Promise<PageResponse<SinhVienResponse>> {
    const cleanParams: Record<string, any> = {}
    if (params?.keyword) cleanParams.keyword = params.keyword
    if (params?.maLop && params.maLop !== "all") cleanParams.maLop = params.maLop
    if (params?.maKhoa && params.maKhoa !== "all") cleanParams.maKhoa = params.maKhoa
    if (params?.page !== undefined) cleanParams.page = params.page
    if (params?.size !== undefined) cleanParams.size = params.size
    if (params?.sort) cleanParams.sort = params.sort

    return apiClient.get<never, PageResponse<SinhVienResponse>>("/sinh-vien", {
      params: cleanParams,
    })
  },

  /**
   * Lấy chi tiết hồ sơ Sinh viên theo mã sinh viên
   */
  async getStudentById(maSV: string): Promise<SinhVienResponse> {
    return apiClient.get<never, SinhVienResponse>(`/sinh-vien/${encodeURIComponent(maSV)}`)
  },

  /**
   * Tạo mới một hồ sơ Sinh viên
   */
  async createStudent(data: SinhVienRequest): Promise<SinhVienResponse> {
    return apiClient.post<never, SinhVienResponse>("/sinh-vien", data)
  },

  /**
   * Cập nhật toàn bộ thông tin Sinh viên
   */
  async updateStudent(maSV: string, data: SinhVienRequest): Promise<SinhVienResponse> {
    return apiClient.put<never, SinhVienResponse>(`/sinh-vien/${encodeURIComponent(maSV)}`, data)
  },

  /**
   * Cập nhật thông tin liên hệ sinh viên (SĐT, Địa chỉ, Email)
   */
  async updateProfile(
    maSV: string,
    data: SinhVienProfileUpdateRequest
  ): Promise<SinhVienResponse> {
    return apiClient.patch<never, SinhVienResponse>(
      `/sinh-vien/${encodeURIComponent(maSV)}/profile`,
      data
    )
  },

  /**
   * Xóa hồ sơ Sinh viên (tự động xóa kèm kết quả học tập liên quan)
   */
  async deleteStudent(maSV: string): Promise<{ _message?: string }> {
    return apiClient.delete<never, { _message?: string }>(`/sinh-vien/${encodeURIComponent(maSV)}`)
  },
}
