"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { CatalogView } from "@/components/catalog-view"
import { DashboardView } from "@/components/dashboard-view"
import { GradesView } from "@/components/grades-view"
import { StudentsView } from "@/components/students-view"
import { TeacherDashboardView } from "@/components/teacher-dashboard-view"
import { TeacherGradebookView } from "@/components/teacher-gradebook-view"
import { TeacherProfileView } from "@/components/teacher-profile-view"
import { StudentPortalView } from "@/components/student-portal-view"
import { StudentProfileView } from "@/components/student-profile-view"
import { AdminProfileView } from "@/components/admin-profile-view"
import { ClassesView } from "@/components/classes-view"
import { authService, type LoginResponse } from "@/services"

const catalogRoutes = new Set(["/khoa", "/mon-hoc", "/giang-vien", "/hoc-ky"])

const adminOnlyRoutes = new Set(["/diem", "/lop", "/khoa", "/giang-vien"])
const studentRestrictedRoutes = new Set(["/diem", "/lop", "/khoa", "/giang-vien", "/sinh-vien", "/so-diem"])

export function AdminWorkspace() {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<LoginResponse | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  // Lưu trạng thái chuyển nhanh từ Dashboard vào Sổ điểm lớp học phần
  const [gradebookTarget, setGradebookTarget] = useState<{
    maLop: string
    maMH: string
    maHK: string
  } | null>(null)

  const activePath = pathname === "/dashboard" ? "/" : pathname

  useEffect(() => {
    const token = authService.getCurrentToken()
    if (!token) {
      router.replace("/login")
      return
    }

    const user = authService.getCurrentUser()
    setCurrentUser(user)
    setIsAuthenticated(true)
  }, [router])

  // Phân quyền bảo vệ route (Route Guard)
  useEffect(() => {
    if (!currentUser) return

    const role = currentUser.role

    if (role === "SINHVIEN" && studentRestrictedRoutes.has(activePath)) {
      toast.warning("Bạn không có quyền truy cập phân hệ quản trị này.")
      router.replace("/")
      return
    }

    if (role === "GIANGVIEN" && adminOnlyRoutes.has(activePath)) {
      toast.warning("Phân hệ này chỉ dành cho Quản trị viên.")
      router.replace("/")
      return
    }
  }, [activePath, currentUser, router])

  const navigateTo = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  const renderView = () => {
    const role = currentUser?.role || "ADMIN"

    // ==================== VAI TRÒ SINH VIÊN ====================
    if (role === "SINHVIEN") {
      if (activePath === "/ho-so") {
        return (
          <StudentProfileView
            maSV={currentUser?.maSV}
            onNavigateToGrades={() => navigateTo("/")}
          />
        )
      }
      if (activePath === "/hoc-ky") {
        return <CatalogView resource="hoc-ky" />
      }
      // Mặc định là Trang xem Bảng điểm & Kết quả học tập
      return (
        <StudentPortalView
          maSV={currentUser?.maSV}
          onNavigateToProfile={() => navigateTo("/ho-so")}
        />
      )
    }

    // ==================== VAI TRÒ GIẢNG VIÊN ====================
    if (role === "GIANGVIEN") {
      if (activePath === "/so-diem") {
        return (
          <TeacherGradebookView
            maGV={currentUser?.maGV}
            initialLop={gradebookTarget?.maLop}
            initialMH={gradebookTarget?.maMH}
            initialHK={gradebookTarget?.maHK}
            onBack={() => {
              setGradebookTarget(null)
              navigateTo("/")
            }}
          />
        )
      }
      if (activePath === "/sinh-vien") {
        return <StudentsView />
      }
      if (activePath === "/mon-hoc") {
        return <CatalogView resource="mon-hoc" />
      }
      if (activePath === "/hoc-ky") {
        return <CatalogView resource="hoc-ky" />
      }
      if (activePath === "/ho-so") {
        return (
          <TeacherProfileView
            maGV={currentUser?.maGV}
            onNavigateToGradebook={(maLop, maMH, maHK) => {
              setGradebookTarget({ maLop, maMH, maHK })
              navigateTo("/so-diem")
            }}
          />
        )
      }
      // Mặc định là Tổng quan phân công giảng dạy
      return (
        <TeacherDashboardView
          maGV={currentUser?.maGV}
          onNavigateToGradebook={(maLop, maMH, maHK) => {
            setGradebookTarget({ maLop, maMH, maHK })
            navigateTo("/so-diem")
          }}
        />
      )
    }

    // ==================== VAI TRÒ ADMIN (MẶC ĐỊNH) ====================
    if (activePath === "/ho-so") return <AdminProfileView onNavigate={navigateTo} />
    if (activePath === "/sinh-vien") return <StudentsView />
    if (activePath === "/diem") return <GradesView />
    if (activePath === "/lop") return <ClassesView />
    if (catalogRoutes.has(activePath)) {
      return (
        <CatalogView
          resource={activePath.slice(1) as "khoa" | "mon-hoc" | "giang-vien" | "hoc-ky"}
        />
      )
    }
    return <DashboardView />
  }

  // Chờ kiểm tra trạng thái đăng nhập
  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang xác thực phiên làm việc...</p>
        </div>
      </div>
    )
  }

  const roleTitle =
    currentUser?.role === "GIANGVIEN"
      ? "Cổng Giảng viên"
      : currentUser?.role === "SINHVIEN"
      ? "Cổng Sinh viên"
      : "Quản trị đào tạo"

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-background px-4 py-2 text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring"
      >
        Bỏ qua điều hướng
      </a>
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Đóng điều hướng"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <AppSidebar
        activePath={activePath}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        role={currentUser?.role}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        onNavigate={navigateTo}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader
          activePath={activePath}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
        />

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 md:px-6 md:py-7 lg:px-8"
          tabIndex={-1}
        >
          {renderView()}
        </main>

        <footer className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 border-t px-4 py-4 text-[11px] text-muted-foreground md:px-6 lg:px-8">
          <span>© 2026 {roleTitle} • Hệ thống Quản lý Đào tạo Đại học</span>
          <span className="hidden sm:inline">
            Kết nối trực tiếp Spring Boot Backend API (http://localhost:8081/api/v1)
          </span>
        </footer>
      </div>
    </div>
  )
}
