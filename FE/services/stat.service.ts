import apiClient from "@/lib/api-client"
import type {
  DashboardOverviewResponse,
  DiemTrungBinhMonResponse,
  MonHocResponse,
  SiSoLopResponse,
  SinhVienDiemGioiResponse,
  SinhVienResponse,
  ThongKeHocKyResponse,
} from "./types"

export const statService = {
  /**
   * Số liệu tổng quan toàn hệ thống (Dashboard KPIs)
   */
  async getDashboard(): Promise<DashboardOverviewResponse> {
    return apiClient.get<never, DashboardOverviewResponse>("/thong-ke/dashboard")
  },

  /**
   * Thống kê sĩ số sinh viên trong từng lớp (sắp xếp giảm dần)
   */
  async getSiSoLop(): Promise<SiSoLopResponse[]> {
    return apiClient.get<never, SiSoLopResponse[]>("/thong-ke/si-so-lop")
  },

  /**
   * Tính điểm thi cuối kỳ trung bình của từng môn học
   */
  async getDiemTrungBinhMon(): Promise<DiemTrungBinhMonResponse[]> {
    return apiClient.get<never, DiemTrungBinhMonResponse[]>("/thong-ke/diem-trung-binh-mon")
  },

  /**
   * Tìm sinh viên có điểm thi cuối kỳ >= minDiemCK ở môn cụ thể (mặc định 8.0)
   */
  async getSinhVienDiemCao(
    maMH: string,
    minDiemCK: number = 8.0
  ): Promise<SinhVienDiemGioiResponse[]> {
    return apiClient.get<never, SinhVienDiemGioiResponse[]>("/thong-ke/sinh-vien-diem-cao", {
      params: { maMH, minDiemCK },
    })
  },

  /**
   * Liệt kê sinh viên chưa có bản ghi kết quả nào
   */
  async getSinhVienChuaCoDiem(): Promise<SinhVienResponse[]> {
    return apiClient.get<never, SinhVienResponse[]>("/thong-ke/sinh-vien-chua-co-diem")
  },

  /**
   * Thống kê số lượng bản ghi kết quả theo từng học kỳ
   */
  async getSoLuongDiemTheoHocKy(): Promise<ThongKeHocKyResponse[]> {
    return apiClient.get<never, ThongKeHocKyResponse[]>("/thong-ke/so-luong-diem-theo-hoc-ky")
  },

  /**
   * Tìm môn học chưa có sinh viên nào có kết quả
   */
  async getMonHocChuaCoKetQua(): Promise<MonHocResponse[]> {
    return apiClient.get<never, MonHocResponse[]>("/thong-ke/mon-hoc-chua-co-ket-qua")
  },
}
