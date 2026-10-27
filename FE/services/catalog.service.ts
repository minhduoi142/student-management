import apiClient from "@/lib/api-client"
import type {
  GiangVienRequest,
  GiangVienResponse,
  HocKyRequest,
  HocKyResponse,
  KhoaRequest,
  KhoaResponse,
  LopRequest,
  LopResponse,
  MonHocRequest,
  MonHocResponse,
  PhanCongResponse,
} from "./types"

export const catalogService = {
  // ==================== KHOA ====================
  async getAllKhoa(): Promise<KhoaResponse[]> {
    return apiClient.get<never, KhoaResponse[]>("/khoa")
  },

  async getKhoaById(maKhoa: string): Promise<KhoaResponse> {
    return apiClient.get<never, KhoaResponse>(`/khoa/${encodeURIComponent(maKhoa)}`)
  },

  async createKhoa(data: KhoaRequest): Promise<KhoaResponse> {
    return apiClient.post<never, KhoaResponse>("/khoa", data)
  },

  async updateKhoa(maKhoa: string, data: KhoaRequest): Promise<KhoaResponse> {
    return apiClient.put<never, KhoaResponse>(`/khoa/${encodeURIComponent(maKhoa)}`, data)
  },

  async deleteKhoa(maKhoa: string): Promise<{ _message?: string }> {
    return apiClient.delete<never, { _message?: string }>(`/khoa/${encodeURIComponent(maKhoa)}`)
  },

  // ==================== LỚP ====================
  async getAllLop(maKhoa?: string): Promise<LopResponse[]> {
    const params: Record<string, string> = {}
    if (maKhoa && maKhoa !== "all") params.maKhoa = maKhoa
    return apiClient.get<never, LopResponse[]>("/lop", { params })
  },

  async getLopById(maLop: string): Promise<LopResponse> {
    return apiClient.get<never, LopResponse>(`/lop/${encodeURIComponent(maLop)}`)
  },

  async createLop(data: LopRequest): Promise<LopResponse> {
    return apiClient.post<never, LopResponse>("/lop", data)
  },

  async updateLop(maLop: string, data: LopRequest): Promise<LopResponse> {
    return apiClient.put<never, LopResponse>(`/lop/${encodeURIComponent(maLop)}`, data)
  },

  async deleteLop(maLop: string): Promise<{ _message?: string }> {
    return apiClient.delete<never, { _message?: string }>(`/lop/${encodeURIComponent(maLop)}`)
  },

  // ==================== MÔN HỌC ====================
  async getAllMonHoc(): Promise<MonHocResponse[]> {
    return apiClient.get<never, MonHocResponse[]>("/mon-hoc")
  },

  async getMonHocById(maMH: string): Promise<MonHocResponse> {
    return apiClient.get<never, MonHocResponse>(`/mon-hoc/${encodeURIComponent(maMH)}`)
  },

  async createMonHoc(data: MonHocRequest): Promise<MonHocResponse> {
    return apiClient.post<never, MonHocResponse>("/mon-hoc", data)
  },

  async updateMonHoc(maMH: string, data: MonHocRequest): Promise<MonHocResponse> {
    return apiClient.put<never, MonHocResponse>(`/mon-hoc/${encodeURIComponent(maMH)}`, data)
  },

  async deleteMonHoc(maMH: string): Promise<{ _message?: string }> {
    return apiClient.delete<never, { _message?: string }>(`/mon-hoc/${encodeURIComponent(maMH)}`)
  },

  // ==================== HỌC KỲ ====================
  async getAllHocKy(): Promise<HocKyResponse[]> {
    return apiClient.get<never, HocKyResponse[]>("/hoc-ky")
  },

  async getHocKyById(maHK: string): Promise<HocKyResponse> {
    return apiClient.get<never, HocKyResponse>(`/hoc-ky/${encodeURIComponent(maHK)}`)
  },

  async createHocKy(data: HocKyRequest): Promise<HocKyResponse> {
    return apiClient.post<never, HocKyResponse>("/hoc-ky", data)
  },

  async updateHocKy(maHK: string, data: HocKyRequest): Promise<HocKyResponse> {
    return apiClient.put<never, HocKyResponse>(`/hoc-ky/${encodeURIComponent(maHK)}`, data)
  },

  async deleteHocKy(maHK: string): Promise<{ _message?: string }> {
    return apiClient.delete<never, { _message?: string }>(`/hoc-ky/${encodeURIComponent(maHK)}`)
  },

  // ==================== GIẢNG VIÊN ====================
  async getAllGiangVien(maKhoa?: string): Promise<GiangVienResponse[]> {
    const params: Record<string, string> = {}
    if (maKhoa && maKhoa !== "all") params.maKhoa = maKhoa
    return apiClient.get<never, GiangVienResponse[]>("/giang-vien", { params })
  },

  async getGiangVienById(maGV: string): Promise<GiangVienResponse> {
    return apiClient.get<never, GiangVienResponse>(`/giang-vien/${encodeURIComponent(maGV)}`)
  },

  async createGiangVien(data: GiangVienRequest): Promise<GiangVienResponse> {
    return apiClient.post<never, GiangVienResponse>("/giang-vien", data)
  },

  async updateGiangVien(maGV: string, data: GiangVienRequest): Promise<GiangVienResponse> {
    return apiClient.put<never, GiangVienResponse>(`/giang-vien/${encodeURIComponent(maGV)}`, data)
  },

  async deleteGiangVien(maGV: string): Promise<{ _message?: string }> {
    return apiClient.delete<never, { _message?: string }>(`/giang-vien/${encodeURIComponent(maGV)}`)
  },

  async getPhanCongByGiangVien(maGV: string, maHK?: string): Promise<PhanCongResponse[]> {
    const params: Record<string, string> = {}
    if (maHK && maHK !== "all") params.maHK = maHK
    return apiClient.get<never, PhanCongResponse[]>(`/giang-vien/${encodeURIComponent(maGV)}/phan-cong`, { params })
  },
}
