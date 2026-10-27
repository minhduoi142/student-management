import {
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Layers3,
  UserCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react"
import type { RoleEnum } from "@/services"

export type AppNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  description: string
}

export type AppNavigationGroup = {
  label: string
  items: AppNavigationItem[]
}

const adminNavigationGroups: AppNavigationGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", href: "/", icon: LayoutDashboard, description: "Số liệu học vụ và cảnh báo toàn trường" },
    ],
  },
  {
    label: "Đào tạo",
    items: [
      { label: "Sinh viên", href: "/sinh-vien", icon: UsersRound, description: "Hồ sơ sinh viên và thông tin liên hệ" },
      { label: "Quản lý điểm", href: "/diem", icon: FileSpreadsheet, description: "Nhập điểm và xem bảng điểm" },
    ],
  },
  {
    label: "Danh mục",
    items: [
      { label: "Lớp học", href: "/lop", icon: Layers3, description: "Danh sách lớp và cố vấn" },
      { label: "Khoa", href: "/khoa", icon: Landmark, description: "Đơn vị đào tạo" },
      { label: "Môn học", href: "/mon-hoc", icon: BookOpen, description: "Danh mục môn và tín chỉ" },
      { label: "Giảng viên", href: "/giang-vien", icon: UserRound, description: "Hồ sơ giảng viên" },
      { label: "Học kỳ", href: "/hoc-ky", icon: CalendarDays, description: "Năm học và kỳ đào tạo" },
    ],
  },
]

const teacherNavigationGroups: AppNavigationGroup[] = [
  {
    label: "Giảng dạy",
    items: [
      { label: "Phân công giảng dạy", href: "/", icon: LayoutDashboard, description: "Tổng quan các lớp học phần phụ trách" },
      { label: "Sổ điểm học phần", href: "/so-diem", icon: FileSpreadsheet, description: "Nhập điểm CC, GK, CK và tính tổng kết" },
    ],
  },
  {
    label: "Tra cứu học vụ",
    items: [
      { label: "Danh sách sinh viên", href: "/sinh-vien", icon: UsersRound, description: "Tra cứu sinh viên theo lớp và khoa" },
      { label: "Môn học", href: "/mon-hoc", icon: BookOpen, description: "Chương trình đào tạo và số tín chỉ" },
      { label: "Học kỳ", href: "/hoc-ky", icon: CalendarDays, description: "Kế hoạch năm học và học kỳ" },
    ],
  },
  {
    label: "Cá nhân",
    items: [
      { label: "Hồ sơ giảng viên", href: "/ho-so", icon: UserCheck, description: "Thông tin cá nhân và đơn vị công tác" },
    ],
  },
]

const studentNavigationGroups: AppNavigationGroup[] = [
  {
    label: "Học tập",
    items: [
      { label: "Kết quả học tập & GPA", href: "/", icon: FileSpreadsheet, description: "Bảng điểm tích lũy, CPA và tiến độ đào tạo" },
      { label: "Kế hoạch học kỳ", href: "/hoc-ky", icon: CalendarDays, description: "Thời gian biểu năm học và các kỳ đào tạo" },
    ],
  },
  {
    label: "Cá nhân",
    items: [
      { label: "Hồ sơ & Liên hệ", href: "/ho-so", icon: GraduationCap, description: "Thẻ sinh viên và cập nhật SĐT, Email, Địa chỉ" },
    ],
  },
]

export function getNavigationGroups(role?: RoleEnum): AppNavigationGroup[] {
  if (role === "GIANGVIEN") return teacherNavigationGroups
  if (role === "SINHVIEN") return studentNavigationGroups
  return adminNavigationGroups
}

export function getNavigationItems(role?: RoleEnum): AppNavigationItem[] {
  return getNavigationGroups(role).flatMap((group) => group.items)
}

// Fallback legacy navigation items for Admin compatibility
export const navigationGroups = adminNavigationGroups
export const navigationItems = adminNavigationGroups.flatMap((group) => group.items)
export const routeTitles: Record<string, string> = Object.fromEntries(
  [...adminNavigationGroups, ...teacherNavigationGroups, ...studentNavigationGroups]
    .flatMap((group) => group.items)
    .map((item) => [item.href, item.label])
)
