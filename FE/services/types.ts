export type GioiTinh = "Nam" | "Nữ"

export type TrangThaiSinhVien = "DANG_HOC" | "BAO_LUU" | "TOT_NGHIEP" | "BUOC_THOI_HOC"

export type RoleEnum = "ADMIN" | "GIANGVIEN" | "SINHVIEN"

export interface PageResponse<T> {
  content: T[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
  last: boolean
}

// ==================== AUTH & TÀI KHOẢN ====================
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  username: string
  role: RoleEnum
  maSV?: string
  maGV?: string
}

// ==================== SINH VIÊN ====================
export interface SinhVienRequest {
  maSV: string
  hoTen: string
  ngaySinh: string // format: yyyy-MM-dd
  gioiTinh: GioiTinh
  diaChi: string
  email: string
  soDienThoai: string
  maLop: string
  trangThai?: TrangThaiSinhVien
}

export interface SinhVienProfileUpdateRequest {
  diaChi: string
  soDienThoai: string
  email: string
}

export interface SinhVienResponse {
  maSV: string
  hoTen: string
  ngaySinh: string
  gioiTinh: GioiTinh
  diaChi: string
  email: string
  soDienThoai: string
  maLop: string
  tenLop?: string
  maKhoa?: string
  tenKhoa?: string
  trangThai?: TrangThaiSinhVien
}

export interface GetStudentsQuery {
  keyword?: string
  maLop?: string
  maKhoa?: string
  page?: number // 0-based
  size?: number
  sort?: string
}

// ==================== ĐIỂM & KẾT QUẢ ====================
export interface KetQuaRequest {
  maSV: string
  maMH: string
  maHK: string
  maLop?: string
  diemCC?: number
  diemGK?: number
  diemCK?: number
}

export interface KetQuaResponse {
  maSV: string
  hoTenSV?: string
  maLop?: string
  maMH: string
  tenMH?: string
  soTinChi?: number
  maHK: string
  tenHocKy?: string
  diemCC: number
  diemGK: number
  diemCK: number
  diemTongKet: number
  danhGia?: string
}

export interface BangDiemSinhVienResponse {
  maSV: string
  hoTen: string
  maLop: string
  tenLop: string
  tenKhoa: string
  danhSachDiem: KetQuaResponse[]
  tongTinChiTichLuy: number
  diemTrungBinhTichLuy: number
}

// ==================== THỐNG KÊ ====================
export interface DashboardOverviewResponse {
  tongSoKhoa: number
  tongSoGiangVien: number
  tongSoLop: number
  tongSoSinhVien: number
  tongSoMonHoc: number
  tongSoHocKy: number
  tongSoBanGhiDiem: number
}

export interface SiSoLopResponse {
  maLop: string
  tenLop: string
  tenKhoa: string
  siSo: number
}

export interface DiemTrungBinhMonResponse {
  maMH: string
  tenMH: string
  soTinChi: number
  diemCKTrungBinh: number
  soLuongSinhVien: number
}

export interface SinhVienDiemGioiResponse {
  maSV: string
  hoTen: string
  tenLop: string
  maMH: string
  tenMH: string
  diemCK: number
  diemTongKet: number
}

export interface ThongKeHocKyResponse {
  maHK: string
  namHoc: string
  ky: number
  tenHocKy: string
  soLuongKetQua: number
}

// ==================== DANH MỤC ====================
export interface KhoaRequest {
  maKhoa: string
  tenKhoa: string
}

export interface KhoaResponse {
  maKhoa: string
  tenKhoa: string
}

export interface LopRequest {
  maLop: string
  tenLop: string
  khoaHoc: number
  maKhoa: string
  maGVCoVan?: string
}

export interface LopResponse {
  maLop: string
  tenLop: string
  khoaHoc: number
  maKhoa: string
  tenKhoa?: string
  maGVCoVan?: string
  tenGVCoVan?: string
}

export interface MonHocRequest {
  maMH: string
  tenMH: string
  soTinChi: number
}

export interface MonHocResponse {
  maMH: string
  tenMH: string
  soTinChi: number
}

export interface HocKyRequest {
  maHK: string
  namHoc: string
  ky: number
}

export interface HocKyResponse {
  maHK: string
  namHoc: string
  ky: number
  tenHocKy: string
}

export interface GiangVienRequest {
  maGV: string
  hoTen: string
  email: string
  soDienThoai: string
  maKhoa: string
}

export interface GiangVienResponse {
  maGV: string
  hoTen: string
  email: string
  soDienThoai: string
  maKhoa: string
  tenKhoa?: string
}

// ==================== TÀI KHOẢN & PHÂN QUYỀN ====================
export interface TaiKhoanResponse {
  id: number
  username: string
  role: RoleEnum
  maSV?: string
  maGV?: string
  trangThai: boolean
  createdAt: string
}

// ==================== PHÂN CÔNG GIẢNG DẠY ====================
export interface PhanCongResponse {
  maPC: number
  maGV: string
  hoTenGV?: string
  maMH: string
  tenMH?: string
  maLop: string
  tenLop?: string
  maHK: string
  tenHocKy?: string
}
