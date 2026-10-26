import {
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  Landmark,
  LayoutDashboard,
  Layers3,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react"

export type AppNavigationItem = {
  label: string
  href: string
  icon: LucideIcon
  description: string
}

export const navigationGroups: { label: string; items: AppNavigationItem[] }[] = [
  {
    label: "Tổng quan",
    items: [
      { label: "Bảng điều khiển", href: "/", icon: LayoutDashboard, description: "Số liệu học vụ và cảnh báo" },
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

export const navigationItems = navigationGroups.flatMap((group) => group.items)

export const routeTitles: Record<string, string> = Object.fromEntries(
  navigationItems.map((item) => [item.href, item.label])
)
