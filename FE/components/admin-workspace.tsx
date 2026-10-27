"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { CatalogView } from "@/components/catalog-view"
import { ClassesView } from "@/components/classes-view"
import { DashboardView } from "@/components/dashboard-view"
import { FacultiesView } from "@/components/faculties-view"
import { GradesView } from "@/components/grades-view"
import { StudentsView } from "@/components/students-view"
import { authService } from "@/services"

const catalogRoutes = new Set(["/mon-hoc", "/giang-vien", "/hoc-ky"])

export function AdminWorkspace() {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const activePath = pathname === "/dashboard" ? "/" : pathname

  useEffect(() => {
    const token = authService.getCurrentToken()
    if (!token) {
      router.replace("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const navigateTo = (href: string) => {
    setMobileNavOpen(false)
    router.push(href)
  }

  const renderView = () => {
    if (activePath === "/sinh-vien") return <StudentsView />
    if (activePath === "/diem") return <GradesView />
    if (activePath === "/lop") return <ClassesView />
    if (activePath === "/khoa") return <FacultiesView />
    if (catalogRoutes.has(activePath)) return <CatalogView resource={activePath.slice(1) as "mon-hoc" | "giang-vien" | "hoc-ky"} />
    return <DashboardView />
  }

  // Chờ kiểm tra trạng thái đăng nhập, nếu chưa có token thì chuyển hướng về /login
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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <a href="#main-content" className="sr-only z-50 rounded-md bg-background px-4 py-2 text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-ring">Bỏ qua điều hướng</a>
      {mobileNavOpen ? (
        <button type="button" className="fixed inset-0 z-30 bg-black/40 lg:hidden" aria-label="Đóng điều hướng" onClick={() => setMobileNavOpen(false)} />
      ) : null}
      <AppSidebar
        activePath={activePath}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onToggleCollapsed={() => setSidebarCollapsed((current) => !current)}
        onNavigate={navigateTo}
      />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AppHeader
          activePath={activePath}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
        />
        <main id="main-content" className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 md:px-6 md:py-7 lg:px-8" tabIndex={-1}>
          {renderView()}
        </main>
        <footer className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 border-t px-4 py-4 text-[11px] text-muted-foreground md:px-6 lg:px-8">
          <span>© 2026 Hệ thống quản trị đào tạo</span>
          <span className="hidden sm:inline">Kết nối trực tiếp Spring Boot Backend API (http://localhost:8081/api/v1)</span>
        </footer>
      </div>
    </div>
  )
}
